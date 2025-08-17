#!/usr/bin/env bash
set -uo pipefail
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"

# --- Chain ---
: "${CHAIN_ID:=0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe}"
: "${DB_SCHEMA:=opengov}"
: "${ONFINALITY_KEY:=}" 

# --- Probe timeouts ---
: "${HTTP_PROBE_TIMEOUT:=6}"     # seconds
: "${WS_PROBE_TIMEOUT:=12}"      # seconds
: "${MAX_PROBE_ATTEMPTS:=5}"     # total RPC probe tries before giving up
: "${SOFT_SUCCESS_SECONDS:=120}" # if indexer runs > this, keep the same RPC

# --- Concurrency presets (you can override via env) ---
: "${LOCAL_WORKERS:=2}"
: "${LOCAL_BATCH_SIZE:=1000}"
: "${LOCAL_FETCH_SIZE:=1000}"

: "${PUBLIC_WORKERS:=1}"
: "${PUBLIC_BATCH_SIZE:=50}"
: "${PUBLIC_FETCH_SIZE:=50}"

LOG_DIR="./logs"; mkdir -p "$LOG_DIR"

# Load .env if present (e.g., to set WS_ENDPOINT, tuning overrides)
if [ -f .env ]; then
  set -a; . ./.env; set +a
fi

onfinality_pair () {
  [ -z "$ONFINALITY_KEY" ] && return 0
  printf "wss://kusama.api.onfinality.io/ws?apikey=%s|https://kusama.api.onfinality.io/rpc?apikey=%s" "$ONFINALITY_KEY" "$ONFINALITY_KEY"
}

ENDPOINTS=(
  "ws://127.0.0.1:9944|http://127.0.0.1:9944"
  # OnFinality (inserted only if key is set)
)

# If you have a key, push OnFinality near the front:
if [ -n "$ONFINALITY_KEY" ]; then
  ENDPOINTS+=("$(onfinality_pair)")
fi

# Other public fallbacks:
ENDPOINTS+=(
  "wss://rpc.ibp.network/kusama|https://rpc.ibp.network/kusama"
  "wss://kusama.dotters.network|https://kusama.dotters.network"
  "wss://ksm-rpc.stakeworld.io|https://ksm-rpc.stakeworld.io"
  "wss://kusama-mainnet-rpc.itrocket.net|https://kusama-mainnet-rpc.itrocket.net"
)


# If user provides WS_ENDPOINT, push it to the front with a best-guess HTTP pair
if [ -n "${WS_ENDPOINT:-}" ]; then
  case "$WS_ENDPOINT" in
    wss://*) HTTP_GUESS="${WS_ENDPOINT/wss:/https:}" ;;
    ws://*)  HTTP_GUESS="${WS_ENDPOINT/ws:/http:}" ;;
    *)       HTTP_GUESS="" ;;
  esac
  if [ -n "$HTTP_GUESS" ]; then
    ENDPOINTS=("$(printf "%s|%s" "$WS_ENDPOINT" "$HTTP_GUESS")" "${ENDPOINTS[@]}")
  else
    # still allow WS-only; we'll skip HTTP check if it's missing
    ENDPOINTS=("$WS_ENDPOINT" "${ENDPOINTS[@]}")
  fi
fi

# ---- helpers ----

wait_for_db() {
  echo ">> Waiting for Postgres on 127.0.0.1:5432 ..." >&2
  for _ in $(seq 1 60); do
    if command -v pg_isready >/dev/null 2>&1; then
      if pg_isready -q -h 127.0.0.1 -p 5432; then
        echo ">> Postgres is ready." >&2; return 0
      fi
    else
      if (echo > /dev/tcp/127.0.0.1/5432) >/dev/null 2>&1; then
        echo ">> Postgres TCP open." >&2; return 0
      fi
    fi
    sleep 1
  done
  echo "!! Could not reach Postgres at 127.0.0.1:5432. Start it, then rerun." >&2
  return 1
}

http_archive_check () {
  # $1 = HTTP endpoint (may be empty => skip check)
  local ep="$1"
  if [ -z "$ep" ]; then return 0; fi  # allow WS-only entries
  local gen ok
  gen="$(curl -m "$HTTP_PROBE_TIMEOUT" -s -H 'content-type: application/json' \
        --data '{"id":1,"jsonrpc":"2.0","method":"chain_getBlockHash","params":[1]}' "$ep" \
        | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')"
  if [ -z "$gen" ]; then return 1; fi
  ok="$(curl -m "$HTTP_PROBE_TIMEOUT" -s -H 'content-type: application/json' \
        --data '{"id":2,"jsonrpc":"2.0","method":"state_getRuntimeVersion","params":["'"$gen"'"]}' "$ep" \
        | grep -c '"result"')"
  [ "$ok" -ge 1 ] || return 1
  return 0
}

render_manifest() {
  local out=".project.effective.yaml"
  if command -v envsubst >/dev/null 2>&1; then
    WS_ENDPOINT="$CHOSEN_WS" CHAIN_ID="$CHAIN_ID" envsubst < project.yaml > "$out"
  else
    sed -E \
      -e "s|\$\{WS_ENDPOINT\}|$CHOSEN_WS|g" \
      -e "s|\$\{CHAIN_ID\}|$CHAIN_ID|g" \
      project.yaml > "$out"
  fi
  { echo ">> Using manifest:"; sed -n '/^network:/,/^dataSources:/p' "$out"; } >&2
  printf '%s\n' "$out"
}

ws_probe () {
  # $1 = WS endpoint, $2 = genesis hash (CHAIN_ID)
  local ws="$1" gen="${2:-0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe}"
  node -e "
    const { ApiPromise, WsProvider } = require('@polkadot/api');
    const ws = '$ws'; const gen = '$gen';
    const provider = new WsProvider(ws, 10_000);
    const timer = setTimeout(() => { process.stderr.write('WS probe timeout\\n'); process.exit(2); }, ${WS_PROBE_TIMEOUT}000);
    (async () => {
      const api = await ApiPromise.create({ provider });
      try {
        // Archive litmus via WS as well
        await api.rpc.state.getRuntimeVersion(gen);
        clearTimeout(timer); process.exit(0);
      } catch (e) {
        clearTimeout(timer); process.stderr.write(String(e)+'\\n'); process.exit(1);
      }
    })().catch(e => { clearTimeout(timer); process.stderr.write(String(e)+'\\n'); process.exit(1); });
  " >/dev/null 2>&1
  return $?
}

pick_working_endpoint () {
  local tries=0 ws http gen="$CHAIN_ID"
  while [ "$tries" -lt "$MAX_PROBE_ATTEMPTS" ]; do
    for pair in "${ENDPOINTS[@]}"; do
      ws="${pair%%|*}"; http="${pair##*|}"
      echo ">> Probing RPC: WS=$ws  HTTP=$http" >&2
      if http_archive_check "$http" && ws_probe "$ws" "$gen"; then
        echo "$ws"; return 0
      fi
      tries=$((tries+1))
      [ "$tries" -lt "$MAX_PROBE_ATTEMPTS" ] || break
    done
  done
  return 1
}

is_local_ws () {
  case "$1" in
    ws://127.0.0.1:*|ws://localhost:*) return 0 ;;
    *) return 1 ;;
  esac
}

# ---- main loop ----
backoff=30; max_backoff=300

while true; do
  echo "==== $(date) :: starting endpoint discovery ====" | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"

  # Ensure DB is reachable before trying RPC
  if ! wait_for_db; then
    echo "!! Postgres unreachable. Start it (e.g., docker run -p 5432:5432 postgres:14) and rerun." | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"
    sleep "$backoff"; (( backoff = backoff*2 > max_backoff ? max_backoff : backoff*2 ))
    continue
  fi

  CHOSEN_PAIR="$(pick_working_endpoint || true)"
  if [ -z "$CHOSEN_PAIR" ]; then
    echo "!! No reachable local or PUBLIC ARCHIVE Kusama RPC after $MAX_PROBE_ATTEMPTS attempts." | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"
    echo "   Suggestion: run your own local ARCHIVE node or use a keyed archive provider (OnFinality/Dwellir)." | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"
    exit 1
  fi

  CHOSEN_WS="${CHOSEN_PAIR%%|*}"
  echo "==== $(date) :: starting indexer ====" | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"
  echo "WS_ENDPOINT=$CHOSEN_WS  CHAIN_ID=$CHAIN_ID  DB_SCHEMA=$DB_SCHEMA" | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"

  # Pick turbo or conservative tunings automatically
  if is_local_ws "$CHOSEN_WS"; then
    CHOSEN_WORKERS="${LOCAL_WORKERS}"
    CHOSEN_BATCH="${LOCAL_BATCH_SIZE}"
    CHOSEN_FETCH="${LOCAL_FETCH_SIZE}"
    echo ">> Using LOCAL turbo settings: workers=$CHOSEN_WORKERS batch=$CHOSEN_BATCH fetch=$CHOSEN_FETCH" | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"
  else
    CHOSEN_WORKERS="${PUBLIC_WORKERS}"
    CHOSEN_BATCH="${PUBLIC_BATCH_SIZE}"
    CHOSEN_FETCH="${PUBLIC_FETCH_SIZE}"
    echo ">> Using PUBLIC conservative settings: workers=$CHOSEN_WORKERS batch=$CHOSEN_BATCH fetch=$CHOSEN_FETCH" | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"
  fi

  EFFECTIVE_MANIFEST="$(render_manifest)"

  # start timer (guard against set -u issues if something blows up early)
  start_ts=$(date +%s)

  WS_ENDPOINT="$CHOSEN_WS" CHAIN_ID="$CHAIN_ID" \
  npx --yes -p @subql/node@1.21.2 subql-node -f "$EFFECTIVE_MANIFEST" \
    --disable-dictionary \
    --disable-historical \
    --db-postgres "postgresql://postgres:postgres@127.0.0.1:5432/subquery" \
    --db-schema "$DB_SCHEMA" \
    --unsafe \
    --workers "$CHOSEN_WORKERS" \
    --batch-size "$CHOSEN_BATCH" \
    --fetch-size "$CHOSEN_FETCH" \
    --timeout 600000 \
    --csv-out-dir ./csv 2>&1 | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"

  rc=${PIPESTATUS[0]}
  end_ts=$(date +%s)
  ran=$(( end_ts - ${start_ts:-$end_ts} ))

  echo "==== $(date) :: indexer exited (code=$rc, ran ${ran}s) ====" | tee -a "$LOG_DIR/indexer-$(date +%Y%m%d).log"

  # If it died too quickly, rotate public RPC list for next attempt
  if [ "$ran" -lt "$SOFT_SUCCESS_SECONDS" ]; then
    first="${ENDPOINTS[0]}"; ENDPOINTS=("${ENDPOINTS[@]:1}" "$first")
  fi

  sleep "$backoff"; (( backoff = backoff*2 > max_backoff ? max_backoff : backoff*2 ))
done

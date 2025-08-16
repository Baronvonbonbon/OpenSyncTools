#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-parity/polkadot:latest}"
NAME="${NAME:-kusama-node}"
DATA_DIR="${KUSAMA_DATA:-$HOME/kusama-data}"
WS_PORT="${WS_PORT:-9944}"
P2P_PORT="${P2P_PORT:-30333}"

ensure_data_dir() { mkdir -p "$DATA_DIR"; }

run_container() {
  local mode="$1"   # archive | pruned
  ensure_data_dir

  # Build pruning flags
  if [[ "$mode" == "archive" ]]; then
    PRUNE_FLAGS=(--state-pruning=archive --blocks-pruning=archive)
  else
    # keep only recent history (tune values as you like)
    PRUNE_FLAGS=(--state-pruning=256 --blocks-pruning=256)
  fi

  # If exists, just start it
  if docker ps -a --format '{{.Names}}' | grep -qx "$NAME"; then
    echo "Container $NAME already exists, starting it…"
    docker start "$NAME"
    exit 0
  fi

  echo "Starting $NAME ($mode) with data at $DATA_DIR"
  docker run -d --name "$NAME" \
    -p 127.0.0.1:${WS_PORT}:9944 \
    -p 0.0.0.0:${P2P_PORT}:30333 \
    -v "${DATA_DIR}:/polkadot" \
    "$IMAGE" \
      --chain=kusama \
      --base-path=/polkadot \
      --name="local-${mode}" \
      --wasm-execution=Compiled \
      --rpc-cors=all \
      --rpc-external \
      --rpc-methods=Safe \
      --rpc-port=9944 \
      --out-peers=50 \
      --in-peers=50 \
      --db-cache=8192 \
      "${PRUNE_FLAGS[@]}"


  echo "Use: ./kusama-node.sh logs  (Ctrl+C to stop tailing)"
}

case "${1:-}" in
  start-archive) run_container archive ;;
  start-pruned)  run_container pruned  ;;
  pause)         docker pause "$NAME" ;;
  resume)        docker unpause "$NAME" ;;
  stop)          docker stop "$NAME" ;;
  status)        docker ps -a --filter "name=$NAME" ;;
  logs)          docker logs -f --tail=200 "$NAME" ;;
  destroy)
    read -r -p "This will STOP container and DELETE ${DATA_DIR}. Are you sure? [y/N] " ans
    if [[ "$ans" =~ ^[Yy]$ ]]; then
      docker rm -f "$NAME" 2>/dev/null || true
      rm -rf "$DATA_DIR"
      echo "Destroyed container and data dir."
    else
      echo "Aborted."
    fi
    ;;
  *)
    cat <<EOF
Usage:
  ./kusama-node.sh start-archive    # full archive (for SubQuery backfill from genesis)
  ./kusama-node.sh start-pruned     # light(er) mode for day-to-day (no full history)
  ./kusama-node.sh pause|resume     # pause/unpause the node
  ./kusama-node.sh stop             # graceful stop
  ./kusama-node.sh status           # show container status
  ./kusama-node.sh logs             # tail logs
  ./kusama-node.sh destroy          # stop & delete ALL local node files
Env vars: IMAGE parity/polkadot:latest, NAME kusama-node, KUSAMA_DATA \$HOME/kusama-data,
          WS_PORT 9944, P2P_PORT 30333
EOF
    ;;
esac


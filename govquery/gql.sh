#!/usr/bin/env bash
set -euo pipefail

# === Defaults (override via env or CLI) ===
PGHOST=${PGHOST:-127.0.0.1}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-postgres}
PGDATABASE=${PGDATABASE:-subquery}

# The "project name" that @subql/query uses to look up the DB schema in public.subqueries
NAME=${NAME:-opengov}

# Target GraphQL port (auto-bumps if busy)
PORT=${PORT:-3000}

# Schema to serve. If empty or "auto", we'll pick latest matching "opengov_*" (or fall back to "opengov")
SCHEMA=${SCHEMA:-auto}

NPX_QUERY_PKG="@subql/query@2.23.3"

# --- helpers ---

die(){ echo "ERROR: $*" >&2; exit 1; }

wait_for_db(){
  echo ">> Waiting for Postgres $PGHOST:$PGPORT/$PGDATABASE ..."
  for _ in $(seq 1 60); do
    if PGPASSWORD="$PGPASSWORD" pg_isready -h "$PGHOST" -p "$PGPORT" -d "$PGDATABASE" -q 2>/dev/null; then
      echo ">> Postgres is ready."
      return 0
    fi
    sleep 1
  done
  die "Postgres not reachable."
}

psql_cmd(){
  PGPASSWORD="$PGPASSWORD" psql "postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE" -v ON_ERROR_STOP=1 "$@"
}

latest_schema(){
  # Prefer latest "opengov_<timestamp>" numerically; else empty
  psql_cmd -Atc \
    "select schema_name
       from information_schema.schemata
      where schema_name like 'opengov_%'
      order by nullif(regexp_replace(schema_name,'^opengov_',''),'')::bigint desc
      limit 1;"
}

ensure_mapping_table(){
  psql_cmd <<'SQL'
CREATE TABLE IF NOT EXISTS public.subqueries (
  id        SERIAL PRIMARY KEY,
  name      TEXT UNIQUE NOT NULL,
  db_schema TEXT UNIQUE NOT NULL
);
SQL
}

map_name_to_schema(){
  local name="$1" schema="$2"
  ensure_mapping_table
  psql_cmd <<SQL
INSERT INTO public.subqueries (name, db_schema)
VALUES ('$name', '$schema')
ON CONFLICT (name) DO UPDATE SET db_schema = EXCLUDED.db_schema;
SQL
}

schema_exists(){
  local schema="$1"
  psql_cmd -Atc "select 1 from information_schema.schemata where schema_name = '$schema' limit 1;" | grep -q 1
}

port_in_use(){
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$port" 2>/dev/null | grep -q ":$port"
  else
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  fi
}

pick_port(){
  local p="$1"
  for try in $(seq 0 20); do
    local candidate=$((p + try))
    if ! port_in_use "$candidate"; then
      echo "$candidate"; return 0
    fi
  done
  die "No free port in range $p-$((p+20))"
}

show_status(){
  echo "== Mapping table =="
  psql_cmd -Atc "select name||' -> '||db_schema from public.subqueries order by 1;" 2>/dev/null || echo "(no public.subqueries table yet)"
  echo
  echo "== Available opengov_* schemas =="
  psql_cmd -Atc "select schema_name from information_schema.schemata where schema_name like 'opengov_%' order by schema_name desc;" || true
  echo
  echo "== Listener on port $PORT (if any) =="
  if command -v ss >/dev/null 2>&1; then
    ss -ltnp "sport = :$PORT" || true
  else
    lsof -nP -iTCP:"$PORT" -sTCP:LISTEN || true
  fi
}

start_query(){
  wait_for_db

  # Pick schema
  local chosen="$SCHEMA"
  if [ "$chosen" = "auto" ] || [ -z "$chosen" ]; then
    chosen="$(latest_schema || true)"
    if [ -z "$chosen" ]; then
      # Fall back to plain "opengov" (will 404 in GraphQL until indexer creates it)
      chosen="opengov"
      echo "!! No opengov_* schemas found; using fallback schema: $chosen"
    else
      echo ">> Auto-selected latest schema: $chosen"
    fi
  fi

  # Create/refresh mapping
  echo ">> Mapping name '$NAME' -> schema '$chosen'"
  map_name_to_schema "$NAME" "$chosen"

  # Verify schema presence (warn only)
  if schema_exists "$chosen"; then
    local table_count
    table_count=$(psql_cmd -Atc "select count(*) from information_schema.tables where table_schema='$chosen';")
    echo ">> Schema '$chosen' exists with $table_count tables."
  else
    echo "!! Schema '$chosen' does not exist yet. GraphQL will start, but queries will fail until the indexer creates it."
  fi

  # Port selection
  local port=$(pick_port "$PORT")
  [ "$port" != "$PORT" ] && echo ">> Port $PORT busy; using $port"
  echo ">> Starting @subql/query ($NPX_QUERY_PKG) on http://localhost:$port for name '$NAME'"

  # Run server (inherits PG* env)
  PGHOST="$PGHOST" PGPORT="$PGPORT" PGUSER="$PGUSER" PGPASSWORD="$PGPASSWORD" PGDATABASE="$PGDATABASE" \
  npx --yes "$NPX_QUERY_PKG" --name "$NAME" --playground --port "$port"
}

stop_query(){
  # Best-effort: kill Node binding to $PORT
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -t -iTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo ">> Stopping GraphQL on $PORT (PIDs: $pids)"
      kill $pids || true
    else
      echo "No process listening on $PORT."
    fi
  else
    echo "Install 'lsof' or use your process manager to stop the service."
  fi
}

# === CLI ===
cmd="${1:-help}"
shift || true

case "$cmd" in
  start)   start_query "$@";;
  stop)    stop_query;;
  status)  show_status;;
  map)     # usage: ./gql.sh map <schema> [<name>]
           target="${1:-}"; [ -z "$target" ] && die "Usage: $0 map <schema> [<name>]"
           [ -n "${2:-}" ] && NAME="$2"
           wait_for_db
           echo ">> Mapping '$NAME' -> '$target'"
           map_name_to_schema "$NAME" "$target"
           show_status
           ;;
  pick-latest)
           latest_schema || true
           ;;
  psql)    # open psql to DB
           psql_cmd ;;
  help|*)  cat <<EOF
Usage: $0 <command> [options]

Commands:
  start           Start GraphQL server for NAME -> SCHEMA (auto-picks latest if SCHEMA=auto)
  stop            Stop server listening on PORT (default $PORT)
  status          Show mapping table, known schemas, and listener status
  map <schema>    Map NAME (default '$NAME') to a specific schema (e.g. opengov_1712345678)
  pick-latest     Print the latest opengov_* schema name
  psql            Open psql to $PGHOST:$PGPORT/$PGDATABASE

Environment overrides:
  PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE
  NAME   (default: opengov)
  SCHEMA (default: auto)
  PORT   (default: 3000)

Examples:
  NAME=opengov SCHEMA=auto PORT=3000 ./gql.sh start
  ./gql.sh map opengov_1755311162
  ./gql.sh status
EOF
           ;;
esac


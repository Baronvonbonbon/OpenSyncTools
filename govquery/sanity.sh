#!/usr/bin/env bash
# Postgres + SubQuery sanity checker
# Usage: [PGHOST=...] [PGPORT=...] [PGUSER=...] [PGPASSWORD=...] [PGDATABASE=...] [DB_SCHEMA=...] ./sanity.sh
# Safe: read-only checks; prints suggested commands if something's off.

set -uo pipefail

# ---------- Config / Defaults ----------
: "${PGHOST:=127.0.0.1}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"
: "${PGPASSWORD:=postgres}"   # not echoed
: "${PGDATABASE:=subquery}"
: "${DB_SCHEMA:=opengov}"     # your SubQuery schema name
: "${GRAPHQL_PORT:=3000}"     # where you run @subql/query
: "${INDEXER_LOG:=""}"        # optional: path to your indexer log for quick tail

export PGPASSWORD  # ensure psql picks it up

fatal=0
warns=0

# ---------- Pretty print ----------
green(){ printf "\033[32m%s\033[0m\n" "$*"; }
red(){ printf "\033[31m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }
blue(){ printf "\033[36m%s\033[0m\n" "$*"; }
hr(){ printf '%*s\n' 80 | tr ' ' '-'; }

ok(){ green "✔ $*"; }
warn(){ yellow "⚠ $*"; warns=$((warns+1)); }
fail(){ red "✖ $*"; fatal=$((fatal+1)); }

# ---------- Helpers ----------
have(){ command -v "$1" >/dev/null 2>&1; }

listen_on(){
  # $1 port
  local port="$1"
  if have ss; then
    ss -ltnp "sport = :$port" 2>/dev/null | tail -n +2
  elif have lsof; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN 2>/dev/null
  else
    return 2
  fi
}

pg_query(){
  # $1 SQL
  PGPASSWORD="$PGPASSWORD" psql "postgresql://$PGUSER@$PGHOST:$PGPORT/$PGDATABASE" -Atqc "$1"
}

# ---------- Start ----------
hr
blue "SubQuery / Postgres sanity check"
date

hr
blue "Environment (effective)"
echo " PGHOST=$PGHOST  PGPORT=$PGPORT  PGUSER=$PGUSER  PGDATABASE=$PGDATABASE  DB_SCHEMA=$DB_SCHEMA"
echo " GRAPHQL_PORT=$GRAPHQL_PORT"
[ -n "${INDEXER_LOG}" ] && echo " INDEXER_LOG=$INDEXER_LOG"
echo

# ---------- Binaries ----------
hr
blue "Binaries"
if have psql; then ok "psql found: $(psql --version)"; else fail "psql not found (install: sudo apt-get install postgresql-client)"; fi
if have pg_isready; then ok "pg_isready found"; else warn "pg_isready not found (optional, package: postgresql-client)"; fi
if have docker; then ok "docker found: $(docker --version | awk '{print $3}' | tr -d ,)"; else warn "docker not found (only needed if you run DB in Docker)"; fi

# ---------- Port 5432 listener ----------
hr
blue "Network: is something listening on $PGPORT?"
if out="$(listen_on "$PGPORT")" && [ -n "$out" ]; then
  echo "$out"
  ok "Port $PGPORT has a listener."
  if echo "$out" | grep -qi docker-proxy; then
    warn "5432 appears to be provided by Docker (docker-proxy)."
    if have docker; then
      echo
      blue "Docker containers exposing 5432:"
      docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | (grep -E '0\.0\.0\.0:5432|:5432->' || true)
    fi
  fi
else
  fail "Nothing is listening on $PGHOST:$PGPORT."
  echo
  echo "Start a Postgres quickly (Docker):"
  echo "  docker run -d --name subquery-postgres \\"
  echo "    -e POSTGRES_PASSWORD=$PGPASSWORD -e POSTGRES_DB=$PGDATABASE \\"
  echo "    -p $PGPORT:5432 postgres:14"
  echo
  echo "Or start your system service:"
  echo "  sudo systemctl start postgresql"
fi

# ---------- pg_isready ----------
hr
blue "pg_isready probe"
if have pg_isready; then
  if pg_isready -q -h "$PGHOST" -p "$PGPORT" -d "$PGDATABASE" -U "$PGUSER"; then
    ok "pg_isready: server accepts connections."
  else
    fail "pg_isready: server NOT accepting connections at $PGHOST:$PGPORT/$PGDATABASE."
  fi
else
  warn "Skipping pg_isready (binary missing)."
fi

# ---------- Try connecting & basic facts ----------
hr
blue "psql connection test and server info"
if info="$(pg_query "select version(), current_setting('port'), current_setting('data_directory');")"; then
  ok "Connected to Postgres."
  echo "$info" | awk -F'|' 'BEGIN{OFS=" | "} {print "  version: " $1; print "  port:    " $2; print "  data:    " $3; }'
else
  fail "psql connection failed (check credentials / server)."
fi

# ---------- Extensions ----------
hr
blue "Extensions (btree_gist required if you enable historical state)"
if exts="$(pg_query "select extname from pg_extension order by 1;")"; then
  echo "$exts" | sed 's/^/  - /'
  if ! echo "$exts" | grep -qx 'btree_gist'; then
    warn "btree_gist not installed."
    echo "Install it (as superuser on the DB):"
    echo "  PGPASSWORD=$PGPASSWORD psql 'postgresql://$PGUSER@$PGHOST:$PGPORT/$PGDATABASE' -c \"CREATE EXTENSION IF NOT EXISTS btree_gist;\""
  else
    ok "btree_gist present."
  fi
else
  warn "Could not list extensions (connection or permission issue)."
fi

# ---------- Schemas and tables ----------
hr
blue "Schemas and SubQuery artifacts"
if schemas="$(pg_query "select nspname from pg_namespace where nspname in ('public', '$DB_SCHEMA') order by 1;")"; then
  echo "$schemas" | sed 's/^/  - /'
  if ! echo "$schemas" | grep -qx "$DB_SCHEMA"; then
    warn "Schema '$DB_SCHEMA' does not exist yet (likely indexer hasn’t created it)."
  else
    ok "Schema '$DB_SCHEMA' exists."
    if tables="$(pg_query "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='$DB_SCHEMA' and c.relkind='r';")"; then
      echo "  tables in $DB_SCHEMA: $tables"
      if [ "$tables" -eq 0 ] 2>/dev/null; then
        warn "No tables in '$DB_SCHEMA' yet — indexer may not have applied migrations."
      fi
    fi
  fi
else
  warn "Could not list schemas (connection or permission issue)."
fi

# Check public.subqueries mapping (used by @subql/query when --name is used)
if mapping="$(pg_query "select name, db_schema from public.subqueries order by 1;" 2>/dev/null)"; then
  blue "public.subqueries mapping:"
  if [ -n "$mapping" ]; then
    echo "$mapping" | awk -F'|' '{printf "  - name=%s -> schema=%s\n", $1, $2}'
  else
    warn "No rows in public.subqueries (optional, only needed if you use --name with @subql/query)."
    echo "Create one (example):"
    echo "  PGPASSWORD=$PGPASSWORD psql 'postgresql://$PGUSER@$PGHOST:$PGPORT/$PGDATABASE' -c \"INSERT INTO public.subqueries(name, db_schema) VALUES ('opengov','$DB_SCHEMA') ON CONFLICT(name) DO UPDATE SET db_schema=EXCLUDED.db_schema;\""
  fi
else
  warn "Table public.subqueries not found (normal if @subql/query hasn’t created it)."
  echo "You can create it manually if you want name→schema mapping:"
  echo "  PGPASSWORD=$PGPASSWORD psql 'postgresql://$PGUSER@$PGHOST:$PGPORT/$PGDATABASE' <<'SQL'"
  echo "  CREATE TABLE IF NOT EXISTS public.subqueries (id serial primary key, name text unique not null, db_schema text unique not null);"
  echo "  INSERT INTO public.subqueries (name, db_schema) VALUES ('opengov','$DB_SCHEMA')"
  echo "  ON CONFLICT (name) DO UPDATE SET db_schema = EXCLUDED.db_schema;"
  echo "  SQL"
fi

# ---------- GraphQL port ----------
hr
blue "GraphQL (@subql/query) port $GRAPHQL_PORT"
if gout="$(listen_on "$GRAPHQL_PORT")" && [ -n "$gout" ]; then
  echo "$gout"
  ok "GraphQL appears to be listening on $GRAPHQL_PORT."
else
  warn "Nothing is listening on $GRAPHQL_PORT."
  echo "Start playground (if your schema exists):"
  echo "  PGHOST=$PGHOST PGPORT=$PGPORT PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD PGDATABASE=$PGDATABASE \\"
  echo "  npx --yes @subql/query@2.23.3 --schema '$DB_SCHEMA' --playground --port $GRAPHQL_PORT"
fi

# ---------- Indexer hints ----------
hr
blue "Indexer quick hints"
echo "If '$DB_SCHEMA' is missing or empty, run the indexer with a solid RPC:"
echo "  DB_SCHEMA=$DB_SCHEMA \\"
echo "  npx --yes -p @subql/node@1.21.2 subql-node -f . \\"
echo "    --disable-dictionary --disable-historical \\"
echo "    --db-postgres \"postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/$PGDATABASE\" \\"
echo "    --db-schema \"$DB_SCHEMA\" --unsafe --workers 1 --batch-size 10 --fetch-size 10"
[ -n "${INDEXER_LOG}" ] && { echo; echo "Tail indexer log:"; echo "  tail -f \"$INDEXER_LOG\""; }

# ---------- Summary ----------
hr
if (( fatal > 0 )); then
  fail "Fatal issues: $fatal"
else
  ok "No fatal issues detected."
fi

if (( warns > 0 )); then
  warn "Warnings: $warns (see above for suggested fixes)"
else
  ok "No warnings."
fi

exit $(( fatal > 0 ))


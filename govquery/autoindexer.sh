#!/usr/bin/env bash
set -euo pipefail
CHAIN="${1:-kusama}"

# Defaults
PG="postgresql://postgres:postgres@localhost:5432/subquery"
SCHEMA="opengov"

if [[ "$CHAIN" == "kusama" ]]; then
  export CHAIN_ID="0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe"
  export WS_ENDPOINT="wss://kusama-rpc.polkadot.io"
elif [[ "$CHAIN" == "polkadot" ]]; then
  export CHAIN_ID="polkadot"
  export WS_ENDPOINT="wss://rpc.polkadot.io"
else
  echo "Custom chain - set CHAIN_ID and WS_ENDPOINT env vars before running."
fi

mkdir -p csv

while true; do
  echo "==== $(date) :: starting indexer on $CHAIN (WS=$WS_ENDPOINT) ===="
  npx --yes -p @subql/node@1.21.2 subql-node -f .     --db-postgres "$PG"     --db-schema "$SCHEMA"     --unsafe     --workers 1     --batch-size 100     --fetch-size 100     --timeout 600000     --csv-out-dir ./csv || true
  code=$?
  echo "==== $(date) :: indexer exited (code=$code) ===="
  echo "Crash detected; backing off for 60s..."
  sleep 60
done

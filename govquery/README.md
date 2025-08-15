# OpenGov SubQuery (Kusama/Polkadot) — Full Starter

This repo is a runnable SubQuery indexer that captures **referenda pallet** events and maintains a light `Referendum` record for common lifecycle timestamps.

It mirrors the environment you ended up with when the GraphQL playground was working locally.

---

## Quick Start

### Prereqs
- Node.js 18+ 
- PostgreSQL (database: `subquery`, user: `postgres`, password: `postgres`)
- `git`, `curl`

### 1) Install deps
```bash
npm install
```

### 2) Generate types & build
```bash
npm run codegen
npm run build
```

### 3) Point at a chain

**Kusama (default):** `project.yaml` already defaults to Kusama.
```bash
# either:
npm run index:kusama

# or with the auto-restart wrapper:
./autoindexer.sh kusama
```

**Polkadot:**
```bash
export CHAIN_ID=polkadot
export WS_ENDPOINT=wss://rpc.polkadot.io
npm run index:custom
# or:
./autoindexer.sh polkadot
```

**Custom Substrate chain:** set both env vars and run `index:custom`.
```bash
export CHAIN_ID=<genesis hash or known alias>
export WS_ENDPOINT=wss://<your node>
npm run index:custom
```

### 4) Start GraphQL
In a **separate terminal** after the indexer connects:
```bash
# Using env-based PG config (recommended)
PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=subquery npx --yes @subql/query@2.23.3 --name opengov --playground --port 3000
# → open http://localhost:3000
```

If you see `relation "public.subqueries" does not exist`, it means the indexer hasn't created the meta tables yet. Start the indexer first, then re-run the query service.

---

## What gets indexed?

- **All `referenda.*` events** are captured as `ReferendumEvent` rows with block height/hash, index in block, a timestamp, method name, and serialized event `data` (human/JSON form when available).
- A **light `Referendum` row** is maintained using common event methods:
  - `Submitted`, `DecisionStarted`, `Approved`, `Rejected`, `Cancelled`, `Killed`
  - When possible, the track id is pulled from on-chain storage (`api.query.referenda.referendumInfoFor`). This is best-effort and safe to fail if the runtime layout differs.

---

## Exporting your data

Once the GraphQL server is running at `http://localhost:3000`:

```bash
npm run export:json > out/referenda.json
npm run export:csv   # writes out/referenda.csv
```

You can change the endpoint via `GRAPHQL_HTTP` env var.

---

## Tuning & Stability

Public RPCs often rate-limit (`-32999`). Use these flags (already set in `autoindexer.sh`) to be gentler:

- `--workers 1`
- `--batch-size 25`
- `--fetch-size 25`
- `--timeout 600000`

If you still see disconnects, consider:
- Using a **private RPC** endpoint
- Adding a **local relay** (`smoldot` or full node) and using `ws://127.0.0.1:<port>`
- Letting `autoindexer.sh` auto-restart on failures

---

## Switching networks

The `network:` block in `project.yaml` is env-aware:
```yaml
network:
  chainId: "${CHAIN_ID:-<kusama-genesis-hash>}"
  endpoint: "${WS_ENDPOINT:-wss://kusama-rpc.polkadot.io}"
```
So setting `CHAIN_ID` and `WS_ENDPOINT` at runtime is enough to repoint.

- **Kusama genesis hash:** `0xb0a8d493285c2df73290dfb7e61f870f17b41801197a149ca93654499ea3dafe`
- **Polkadot alias:** `polkadot`

---

## Defining schemas for treasury spends & critical activity

To audit other pallets, add new entity types and event handlers. For example, a minimal **treasury spend** entity:

```graphql
type TreasurySpend @entity {
  id: ID!
  proposalId: Int
  beneficiary: String
  value: BigInt
  blockHeight: Int!
  ts: Date!
}
```

Then add a handler and filter in `project.yaml`:
```yaml
- handler: handleTreasuryEvent
  kind: substrate/EventHandler
  filter:
    module: treasury
```

And implement in `src/index.ts`:
```ts
export async function handleTreasuryEvent(evt: SubstrateEvent): Promise<void> {
  const { event, block } = evt;
  if (event.section !== "treasury") return;

  if (event.method === "Awarded" || event.method === "SpendApproved" || event.method === "Spend") {
    const id = `${block.block.header.number.toString()}-${event.index}`;
    const e = event.data?.toHuman?.() ?? event.data?.toJSON?.() ?? [];
    const spend = new TreasurySpend(id);
    spend.blockHeight = block.block.header.number.toNumber();
    spend.ts = new Date(block.timestamp ?? Date.now());
    // Try to pull typical fields from the tuple
    try {
      // Layouts vary; this is intentionally defensive
      const obj = Array.isArray(e) ? e : Object.values(e ?? {});
      // Common patterns: [proposalIndex, value, beneficiary]
      for (const item of obj) {
        if (typeof item === "object" && item) {
          if ("beneficiary" in item) spend.beneficiary = String(item["beneficiary"]);
          if ("value" in item) spend.value = BigInt(item["value"]);
          if ("index" in item) spend.proposalId = Number(item["index"]);
        }
      }
    } catch {}
    await spend.save();
  }
}
```

Re-run `npm run codegen && npm run build` after changing `schema.graphql` and handlers.

---

## Troubleshooting

- **`-32999: RPC rate limit exceeded`** → Lower concurrency/batch, switch to private/local endpoint; use `autoindexer.sh` to auto-retry.
- **`Unknown signed extensions CheckMetadataHash`** → Safe to ignore; it’s informational.
- **`Historical state is disabled/extension required`** → We default to *disabled*. If you need it, enable `btree_gist` in Postgres and set the project to historical mode (not required here).
- **`relation "public.subqueries" does not exist`** → Start indexer once to initialize DB, then start the query service.
- **Multiple @polkadot/util versions** warnings → typically harmless with the pinned toolchain here. If desired, `npm dedupe` can reduce duplicates.

---

## Repo layout

```
project.yaml
schema.graphql
src/
  index.ts
  global.d.ts
export/
  export-json.ts
  export-csv.ts
autoindexer.sh
```

---

## License

MIT

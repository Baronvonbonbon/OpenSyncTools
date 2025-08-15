# Quick Start: OpenGov Referenda & Treasury Spend Indexer

Follow these steps from a clean machine:

## 1. Install prerequisites
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql
```

## 2. Setup PostgreSQL
```bash
sudo -u postgres psql -c "CREATE DATABASE subquery;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
```

## 3. Clone and install
```bash
git clone <your_repo_url>
cd opengov_full_mappings
npm install
```

## 4. Configure
- Edit `project.yaml` to select Kusama, Polkadot, or another Substrate chain.

## 5. Build
```bash
npx @subql/cli codegen
npx @subql/cli build
```

## 6. Run
Indexer:
```bash
npx subql-node -f . --db-postgres "postgresql://postgres:postgres@localhost:5432/subquery" --db-schema opengov --unsafe
```
GraphQL:
```bash
npx @subql/query --name opengov --playground --port 3000 --pg.host=127.0.0.1 --pg.port=5432 --pg.user=postgres --pg.password=postgres --pg.database=subquery
```

Visit http://localhost:3000 to query your data.

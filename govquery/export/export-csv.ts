import fetch from "node-fetch";
import * as fs from "fs";

const ENDPOINT = process.env.GRAPHQL_HTTP || "http://localhost:3000";
const QUERY = `
query Q($first:Int!, $offset:Int!) {
  referenda(first:$first, offset:$offset, orderBy:id_ASC) {
    id track proposer submittedAt decisionStartedAt approvedAt rejectedAt cancelledAt killedAt
    decisionDeposit submissionDeposit tallyAye tallyNay tallySupport lastUpdatedAt
  }
}`;

function csvEscape(s: string): string {
  if (s == null) return "";
  if (s.includes(",") || s.includes(""") || s.includes("\n")) {
    return `"` + s.replace(/"/g, '""') + `"`;
  }
  return s;
}

async function run() {
  let offset = 0;
  const first = 500;
  const rows: string[] = [];
  const header = [
    "id","track","proposer","submittedAt","decisionStartedAt","approvedAt","rejectedAt","cancelledAt","killedAt",
    "decisionDeposit","submissionDeposit","tallyAye","tallyNay","tallySupport","lastUpdatedAt"
  ];
  rows.push(header.join(","));

  while (true) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { first, offset } }),
    });
    const json: any = await res.json();
    const items = json?.data?.referenda ?? [];
    for (const it of items) {
      const vals = header.map((h) => csvEscape(String(it[h] ?? "")));
      rows.push(vals.join(","));
    }
    if (items.length < first) break;
    offset += first;
  }
  fs.mkdirSync("out", { recursive: True as any }); // TS will accept this via any-cast
  fs.writeFileSync("out/referenda.csv", rows.join("\n"));
  console.log("Wrote out/referenda.csv");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
import fetch from "node-fetch";

const ENDPOINT = process.env.GRAPHQL_HTTP || "http://localhost:3000";
const QUERY = `
query Q($first:Int!, $offset:Int!) {
  referenda(first:$first, offset:$offset, orderBy:id_ASC) {
    id track proposer submittedAt decisionStartedAt approvedAt rejectedAt cancelledAt killedAt
    decisionDeposit submissionDeposit tallyAye tallyNay tallySupport lastUpdatedAt
  }
}`;

async function run() {
  let offset = 0;
  const first = 500;
  const all: any[] = [];
  while (true) {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { first, offset } }),
    });
    const json: any = await res.json();
    const items = json?.data?.referenda ?? [];
    all.push(...items);
    if (items.length < first) break;
    offset += first;
  }
  console.log(JSON.stringify(all, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
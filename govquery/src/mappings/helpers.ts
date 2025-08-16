/* eslint-disable @typescript-eslint/no-explicit-any */
export function blockHeight(evt: any): number {
  // SubQuery ctx for old runner styles commonly expose .block?.block?.header?.number
  const n =
    evt?.block?.block?.header?.number ??
    evt?.block?.header?.number ??
    evt?.event?.blockNumber ??
    0;
  return typeof n?.toNumber === "function"
    ? n.toNumber()
    : Number(n?.toString?.() ?? n ?? 0);
}

export function blockHash(evt: any): string {
  const h =
    evt?.block?.block?.hash ??
    evt?.block?.hash ??
    evt?.event?.blockHash ??
    "";
  return h?.toString?.() ?? String(h ?? "");
}

export function extrinsicHash(evt: any): string | undefined {
  // Try the wrapped extrinsic hash if present
  const hex =
    evt?.extrinsic?.hash ??
    evt?.event?.extrinsic?.hash ??
    evt?.ctx?.extrinsic?.hash;
  return hex ? hex.toString() : undefined;
}

export function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    try {
      // last-resort stringify
      return JSON.stringify(String(v));
    } catch {
      return "null";
    }
  }
}

/** Get all events in the *same block* that belong to the treasury pallet */
export function findTreasuryEventsInBlock(evt: any): any[] {
  const all =
    evt?.block?.events ??
    evt?.ctx?.block?.events ??
    evt?.event?.block?.events ??
    [];
  return all.filter((e: any) => (e?.event?.section ?? e?.section) === "treasury");
}


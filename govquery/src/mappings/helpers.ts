// Lightweight helpers shared by mappings (no @subql/node import here)
/* eslint-disable @typescript-eslint/no-explicit-any */

// SubQuery injects `api` at runtime; declare so TS doesn't complain.
declare const api: any;

export function bnToString(bn: any | undefined): string | undefined {
  try {
    if (bn == null) return undefined;
    return typeof bn === 'string' ? bn : bn.toString();
  } catch {
    return undefined;
  }
}

export function safeJson(input: any): any {
  try {
    return JSON.parse(JSON.stringify(input));
  } catch {
    return input;
  }
}

export function blockHeight(ctx: any): number {
  return Number(ctx.block.block.header.number.toString());
}

export function blockHash(ctx: any): string {
  return ctx.block.block.hash?.toString?.() ?? ctx.block.hash?.toString?.() ?? "";
}

export function extrinsicHash(ctx: any): string | undefined {
  return ctx.extrinsic?.extrinsic?.hash?.toString?.() ?? ctx.extrinsic?.hash?.toString?.();
}

export function findTreasuryEventsInBlock(ctx: any): any[] {
  // Return all treasury-* events from this block
  const events: any[] = ctx.block.events ?? ctx.block.block?.events ?? [];
  return events.filter((e: any) => {
    const sec = e.event?.section ?? e.section;
    return sec === "treasury";
  });
}

export function asAccountId(value: any): string | undefined {
  if (value == null) return undefined;
  try {
    // address codec available via api, but keep generic
    return value.toString();
  } catch {
    return undefined;
  }
}

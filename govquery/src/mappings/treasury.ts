/* eslint-disable @typescript-eslint/no-explicit-any */
import { blockHeight, blockHash, extrinsicHash, asAccountId, safeJson, bnToString } from "./helpers";
import { TreasurySpend } from "../types";

declare const api: any;

/**
 * Standalone treasury event handler. It creates a TreasurySpend row for
 * each spend-like event. If a Referendum executed in the same block,
 * the referenda mapping will later link (or overwrite) the referendumId.
 */
export async function handleTreasuryEvent(event: any): Promise<void> {
  const sec = event.event.section;
  if (sec !== "treasury") return;

  const method = event.event.method;
  const height = blockHeight(event);
  const bhash = blockHash(event);
  const exhash = extrinsicHash(event);
  const id = `${height}-treasury-${event.idx ?? event.event?.index ?? 0}`;

  // Parse common shapes
  const data: any = event.event.data;
  // Try to find beneficiary & amount in common positions
  // Different events: SpendApproved(index, amount, beneficiary) || (beneficiary, amount)
  let beneficiary: string | undefined;
  let amount: string | undefined;
  try {
    const h = data?.toHuman?.() ?? data;
    const arr = Array.isArray(h) ? h : [];
    // naive heuristics
    for (const v of arr) {
      const s = typeof v === 'string' ? v : v?.Id ?? v?.AccountId ?? v?.account ?? v?.who;
      if (!beneficiary && s) { beneficiary = String(s); continue; }
      const a = v?.amount ?? v?.value ?? v;
      if (!amount && (typeof a === "string" || typeof a === "number")) { amount = String(a); }
    }
  } catch {
    // ignore
  }

  const spend = new TreasurySpend(id);
  spend.blockHeight = height;
  spend.blockHash = bhash;
  spend.extrinsicHash = exhash;
  spend.eventMethod = method;
  spend.beneficiary = beneficiary;
  spend.amount = amount;
  spend.args = safeJson(data?.toHuman?.() ?? data);
  spend.createdAt = new Date();
  spend.updatedAt = new Date();

  await spend.save();
}

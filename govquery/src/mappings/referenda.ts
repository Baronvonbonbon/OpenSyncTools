/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  blockHeight,
  blockHash,
  extrinsicHash,
  findTreasuryEventsInBlock,
  safeJson,
} from "./helpers";
import { Referendum, ReferendumEvent, TreasurySpend } from "../types";

declare const api: any;

function toStatus(method: string): string {
  const m = method.toLowerCase();
  if (m.includes("submitted")) return "Submitted";
  if (m.includes("confirmstarted")) return "ConfirmStarted";
  if (m.includes("decisionstarted")) return "DecisionStarted";
  if (m.includes("confirmaborted")) return "ConfirmAborted";
  if (m.includes("approved")) return "Approved";
  if (m.includes("rejected")) return "Rejected";
  if (m.includes("executed")) return "Executed";
  if (m.includes("cancelled")) return "Cancelled";
  if (m.includes("killed")) return "Killed";
  return method;
}

export async function handleReferendaEvent(event: any): Promise<void> {
  const sec = event?.event?.section;
  const method = event?.event?.method;
  if (sec !== "referenda") return;

  const heightNum = blockHeight(event);
  const height = BigInt(heightNum);
  const bhash = blockHash(event);
  const exhash = extrinsicHash(event);
  const status = toStatus(method);

  // Prefer real block timestamp if exposed by your runner
  const ts =
    event?.block?.timestamp != null
      ? new Date(event.block.timestamp)
      : new Date();

  const rawIdx = event?.idx ?? event?.event?.index ?? 0;
  const indexInBlock =
    typeof rawIdx?.toNumber === "function"
      ? rawIdx.toNumber()
      : Number(rawIdx?.toString?.() ?? rawIdx ?? 0);

  const id = `${heightNum}-${indexInBlock}`;

  // Extract common args
  const data = event?.event?.data;
  const refIndex =
    data?.[0]?.toString?.() ??
    data?.index?.toString?.() ??
    data?.referendumIndex?.toString?.();
  const trackRaw =
    data?.track?.toString?.() ?? data?.[1]?.track?.toString?.();
  const outcome =
    method === "Executed"
      ? data?.[1]?.toString?.() ?? data?.[2]?.toString?.()
      : undefined;

  // Ensure Referendum exists
  const rId = refIndex ?? id;
  let r = await Referendum.get(rId);
  if (!r) {
    r = new Referendum(rId);
    r.createdAt = ts;
  }

  // Best-effort on-chain enrichment on submission
  try {
    if (["Submitted", "SubmissionDepositPlaced"].includes(method)) {
      const onchain = await api.query?.referenda?.referendumInfoFor?.(rId);
      if (onchain?.isSome) {
        const info = onchain.unwrap();
        const track = info?.ongoing?.track?.toNumber?.();
        if (typeof track === "number" && !Number.isNaN(track)) r.track = track;
      }
    }
  } catch {
    /* ignore */
  }

  // Update Referendum summary
  r.status = status;
  r.lastSeenAt = ts;
  r.lastStatus = status;
  r.lastStatusAt = ts;
  r.blockHashLast = bhash;
  if (exhash) r.extrinsicHashLast = exhash;

  const trackNum =
    trackRaw != null && !Number.isNaN(Number(trackRaw))
      ? Number(trackRaw)
      : undefined;
  if (trackNum != null) r.track = trackNum;

  // Event log row
  const ev = new ReferendumEvent(id);
  ev.referendumId = r.id;
  ev.section = sec;
  ev.method = method;
  ev.status = status;
  ev.blockHeight = height;
  ev.blockHash = bhash;
  ev.indexInBlock = indexInBlock;
  ev.ts = ts;
  ev.data = safeJson(data?.toHuman?.() ?? data?.toJSON?.() ?? data ?? null);
  ev.args = safeJson(data?.toHuman?.() ?? data ?? null);
  ev.extrinsicHash = exhash;

  // Milestone timestamps
  switch (status) {
    case "Submitted":
      r.submittedAt = ts;
      break;
    case "ConfirmStarted":
      r.confirmStartedAt = ts;
      break;
    case "DecisionStarted":
      r.decisionStartedAt = ts;
      break;
    case "Approved":
      r.approvedAt = ts;
      break;
    case "Rejected":
      r.rejectedAt = ts;
      break;
    case "Cancelled":
      r.cancelledAt = ts;
      break;
    case "Killed":
      r.killedAt = ts;
      break;
    case "Executed":
      r.executedAt = ts;
      r.executionOutcome = outcome;

      // Link same-block treasury events
      for (const te of findTreasuryEventsInBlock(event)) {
        const tmethod = te?.event?.method ?? "";
        const tid = `${heightNum}-treasury-${(te?.idx ?? te?.event?.index) ?? 0}`;

        let spend = await TreasurySpend.get(tid);
        if (!spend) spend = new TreasurySpend(tid);

        spend.referendumId = r.id;
        spend.blockHeight = height;
        spend.blockHash = bhash;
        spend.eventMethod = tmethod;
        spend.extrinsicHash = extrinsicHash(te);
        spend.args = safeJson(te?.event?.data?.toHuman?.() ?? te?.event?.data);
        spend.createdAt = spend.createdAt ?? ts;
        spend.updatedAt = ts;
        await spend.save();
      }
      break;
    default:
      break;
  }

  r.lastUpdatedAt = ts;

  await r.save();
  await ev.save();
}


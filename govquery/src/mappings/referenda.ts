/* eslint-disable @typescript-eslint/no-explicit-any */
import { blockHeight, blockHash, extrinsicHash, findTreasuryEventsInBlock, safeJson, bnToString } from "./helpers";
import { Referendum, ReferendumEvent, TreasurySpend } from "../types";

declare const api: any;

// Normalize status strings
function toStatus(method: string): string {
  const m = method.toLowerCase();
  if (m.includes("submitted")) return "Submitted";
  if (m.includes("confirmstarted")) return "ConfirmStarted";
  if (m.includes("decisionstarted")) return "DecisionStarted";
  if (m.includes("confirmaborted")) return "ConfirmAborted";
  if (m.includes("approved")) return "Approved";
  if (m.includes("rejected")) return "Rejected";
  if (m.includes("executed")) return "Executed";
  return method;
}

export async function handleReferendaEvent(event: any): Promise<void> {
  const sec = event.event.section;
  const method = event.event.method;
  if (sec !== "referenda") return;

  const id = `${blockHeight(event)}-${event.idx ?? event.event?.index ?? 0}`;
  const height = blockHeight(event);
  const bhash = blockHash(event);
  const exhash = extrinsicHash(event);
  const status = toStatus(method);

  // Arguments differ per event, but most include ReferendumIndex as first param
  const data = event.event.data;
  const refIndex = data?.[0]?.toString?.() ?? data?.index?.toString?.();
  const track = data?.track?.toString?.() ?? data?.[1]?.track?.toString?.();
  const outcome = method === "Executed" ? (data?.[1]?.toString?.() ?? data?.[2]?.toString?.()) : undefined;

  // Ensure main Referendum record exists
  let r = await Referendum.get(refIndex ?? id);
  if (!r) {
    r = new Referendum(refIndex ?? id);
    r.createdAt = new Date();
  }

  r.lastSeenAt = new Date();
  r.lastStatus = status;
  r.lastStatusAt = height;
  r.track = track ?? r.track;
  r.blockHashLast = bhash;
  r.extrinsicHashLast = exhash ?? r.extrinsicHashLast;

  // Event log row
  const ev = new ReferendumEvent(id);
  ev.referendumId = r.id;
  ev.section = sec;
  ev.method = method;
  ev.status = status;
  ev.blockHeight = height;
  ev.blockHash = bhash;
  ev.extrinsicHash = exhash;
  ev.args = safeJson(data?.toHuman?.() ?? data);

  // Timestamps by status
  switch (status) {
    case "Submitted":
      r.submittedAt = height;
      break;
    case "ConfirmStarted":
      r.confirmStartedAt = height;
      break;
    case "DecisionStarted":
      r.decisionStartedAt = height;
      break;
    case "Approved":
      r.approvedAt = height;
      break;
    case "Rejected":
      r.rejectedAt = height;
      break;
    case "Executed":
      r.executedAt = height;
      r.executionOutcome = outcome;
      // When the referendum executes, scan same block for treasury events and link them
      for (const te of findTreasuryEventsInBlock(event)) {
        const tmethod = te.event?.method ?? "";
        const tid = `${height}-treasury-${te.idx ?? te.event?.index ?? 0}`;
        let spend = await TreasurySpend.get(tid);
        if (!spend) spend = new TreasurySpend(tid);
        spend.blockHeight = height;
        spend.blockHash = bhash;
        spend.referendumId = r.id;
        spend.eventMethod = tmethod;
        spend.args = safeJson(te.event?.data?.toHuman?.() ?? te.event?.data);
        spend.createdAt = spend.createdAt ?? new Date();
        spend.updatedAt = new Date();
        await spend.save();
      }
      break;
  }

  await r.save();
  await ev.save();
}

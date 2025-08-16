import { SubstrateEvent, SubstrateBlock } from "@subql/types";
import { Referendum, ReferendumEvent } from "./types";

// SubQuery injects `api` and `logger` globals at runtime:
declare const api: any;
declare const logger: any;

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  // Just a placeholder to demonstrate block handler
  // You could store chain-level info here if needed.
}

export async function handleReferendaEvent(evt: SubstrateEvent): Promise<void> {
  const { event, block } = evt;
  const section = event.section;
  const method = event.method;

  // Only process referenda pallet events
  if (section !== "referenda") return;

  const id = `${block.block.header.number.toString()}-${event.index}`;
  const entity = new ReferendumEvent(id);
  entity.referendumId = extractReferendumId(event);
  entity.section = section;
  entity.method = method;
  entity.blockHeight = block.block.header.number.toBigInt?.()
  ?? BigInt(block.block.header.number.toString());
  entity.blockHash = block.block.hash.toString();
  entity.indexInBlock = typeof (event.index as any)?.toNumber === 'function'
  ? (event.index as any).toNumber()
  : Number((event.index as any)?.toString?.() ?? event.index);
  entity.ts = new Date(block.timestamp ?? Date.now());
  entity.data = JSON.stringify(event.data?.toHuman?.() ?? event.data?.toJSON?.() ?? null);
  await entity.save();

  // Maintain a simple Referendum row with basic timestamps for common states
  const refId = entity.referendumId ?? "unknown";
  if (refId !== "unknown") {
    const ref = (await Referendum.get(refId)) ?? new Referendum(refId);
    // Try to enrich with track/deposits when we see a relevant event
    try {
      if (["Submitted", "SubmissionDepositPlaced"].includes(method)) {
        // Pull track/dep from chain storage when available
        // Note: OpenGov storage paths differ by runtime, so keep this defensive
        // If the below fails it won't crash the indexer.
        const onchain = await api.query.referenda?.referendumInfoFor?.(refId);
        if (onchain?.isSome) {
          const info = onchain.unwrap();
          // trackId found under .ongoing.track (common on recent runtimes)
          const track = info?.ongoing?.track?.toNumber?.();
          if (typeof track === "number") ref.track = track;
        }
      }
    } catch (e) {
      logger?.warn?.(`Failed pulling onchain referendum info for ${refId}: ${e}`);
    }

    switch (method) {
      case "Submitted":
        ref.submittedAt = new Date(entity.ts);
        break;
      case "DecisionStarted":
        ref.decisionStartedAt = new Date(entity.ts);
        break;
      case "Approved":
        ref.approvedAt = new Date(entity.ts);
        break;
      case "Rejected":
        ref.rejectedAt = new Date(entity.ts);
        break;
      case "Cancelled":
        ref.cancelledAt = new Date(entity.ts);
        break;
      case "Killed":
        ref.killedAt = new Date(entity.ts);
        break;
      default:
        break;
    }
    ref.lastUpdatedAt = new Date(entity.ts);
    await ref.save();
  }
}

// Try to extract a referendum index from common event arg positions
function extractReferendumId(event: any): string | undefined {
  try {
    // Common layouts:
    // Submitted(Index, TrackId, ...)
    // DecisionStarted(Index, ...)
    // Approved(Index)
    // Rejected(Index)
    // Note: event.data may be Vec<Codec> with objects or primitives depending on metadata
    const data = event.data;
    if (!data) return undefined;

    // Prefer fields with obvious names
    for (const d of data) {
      const h = d?.toHuman?.() ?? d;
      if (typeof h === "object" && h && ("index" in h)) return String(h.index);
      if (typeof h === "object" && h && ("referendumIndex" in h)) return String(h.referendumIndex);
    }
    // Fallback: first numeric-looking arg
    for (const d of data) {
      const n = Number(d);
      if (!Number.isNaN(n)) return String(n);
      const j = d?.toJSON?.();
      const n2 = Number(j);
      if (!Number.isNaN(n2)) return String(n2);
    }
  } catch { /* ignore */ }
  return undefined;
}

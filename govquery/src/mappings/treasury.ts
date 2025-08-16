/* eslint-disable @typescript-eslint/no-explicit-any */
import { blockHeight, blockHash, extrinsicHash, safeJson } from "./helpers";
import { TreasurySpend } from "../types";

function pickBeneficiary(h: any): string | undefined {
  if (h == null) return undefined;
  if (typeof h === "string") return h;
  if (typeof h === "object") {
    return (
      h?.beneficiary ??
      h?.who ??
      h?.account ??
      h?.payee ??
      h?.dest ??
      h?.destination ??
      h?.id ??
      h?.Id ??
      undefined
    )?.toString?.();
  }
  return undefined;
}

function pickAmount(h: any): bigint | undefined {
  if (h == null) return undefined;
  const tryOne = (v: any): bigint | undefined => {
    try {
      const s =
        v?.toString?.() ??
        v?.amount?.toString?.() ??
        v?.value?.toString?.() ??
        v?.balance?.toString?.();
      if (s == null) return undefined;
      const bi = BigInt(s);
      return bi >= 0n ? bi : undefined;
    } catch {
      return undefined;
    }
  };

  if (typeof h === "object") {
    // common shapes: { amount }, { value }, { balance }, arrays, etc.
    const direct = tryOne(h);
    if (direct != null) return direct;
    for (const k of Object.keys(h)) {
      const v = tryOne((h as any)[k]);
      if (v != null) return v;
    }
  }
  // simple scalar
  return tryOne(h);
}

export async function handleTreasuryEvent(event: any): Promise<void> {
  const sec = event?.event?.section;
  if (sec !== "treasury") return;

  const method = event?.event?.method ?? "";
  const heightNum = blockHeight(event);
  const height = BigInt(heightNum);
  const bhash = blockHash(event);
  const exhash = extrinsicHash(event);
  const ts =
    event?.block?.timestamp != null
      ? new Date(event.block.timestamp)
      : new Date();

  const idxRaw = event?.idx ?? event?.event?.index ?? 0;
  const indexInBlock =
    typeof idxRaw?.toNumber === "function"
      ? idxRaw.toNumber()
      : Number(idxRaw?.toString?.() ?? idxRaw ?? 0);

  // unique id per spend-ish record
  const id = `${heightNum}-treasury-${indexInBlock}`;

  let spend = await TreasurySpend.get(id);
  if (!spend) spend = new TreasurySpend(id);

  spend.blockHeight = height;
  spend.blockHash = bhash;
  spend.eventMethod = method;
  spend.extrinsicHash = exhash;

  const data = event?.event?.data;
  const human = data?.toHuman?.() ?? data?.toJSON?.() ?? data;

  // best-effort parse
  // try positional first (many events are [beneficiary, amount] or [amount])
  const h0 = Array.isArray(human) ? human[0] : human;
  const h1 = Array.isArray(human) ? human[1] : undefined;

  const amt =
    pickAmount(h1) ??
    pickAmount(h0) ??
    pickAmount(human);
  const bene =
    pickBeneficiary(h0) ??
    pickBeneficiary(h1) ??
    pickBeneficiary(human);

  if (amt != null) spend.amount = amt;
  if (bene != null) spend.beneficiary = bene;

  spend.args = safeJson(human);
  spend.createdAt = spend.createdAt ?? ts;
  spend.updatedAt = ts;

  await spend.save();
}


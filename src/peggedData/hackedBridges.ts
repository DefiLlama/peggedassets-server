import type { BridgeID } from "./bridgeData";
import type { PeggedTokenBalance } from "../types";

/**
 * Bridges whose wrapped assets stopped being backed at a known point in time.
 *
 * Adapters keep reporting these tokens so that historical refills still show the
 * value that was circulating before the incident. At store time, any bridge
 * balance attributed to one of these bridge ids (via `bridge:` tags, explicit
 * bridge names, or the address lookup in bridgeData.ts) is subtracted from the
 * chain total once the run timestamp is at or past `cutoff`.
 *
 * Tokens whose address is not in the bridge mapping resolve to "not-found" and
 * are NOT excluded; add them to bridgeData.ts with the right bridge id.
 */
export type HackedBridge = {
  bridge: BridgeID;
  cutoff: number; // unix seconds, inclusive
  reason: string;
};

export const HACKED_BRIDGES: HackedBridge[] = [
  {
    bridge: "multichain",
    cutoff: 1688601600, // 2023-07-06 00:00 UTC
    reason: "Multichain (Anyswap) MPC keys compromised, ~$126M drained on 2023-07-06",
  },
];

const byBridge = new Map<string, HackedBridge>(
  HACKED_BRIDGES.map((h) => [String(h.bridge), h])
);

export function isHackedBridgeAt(bridgeID: string, timestamp: number): boolean {
  const h = byBridge.get(bridgeID);
  return !!h && timestamp >= h.cutoff;
}

function bridgeTotal(entry: { [source: string]: { amount?: number | string } }) {
  return Object.values(entry).reduce(
    (sum, s) => sum + Number(s?.amount ?? 0),
    0
  );
}

/**
 * Mutates `balance`: removes every hacked-bridge entry from `balance.bridges`
 * and subtracts its amount from `balance[pegType]`. Returns the amount removed.
 */
export function excludeHackedBridges(
  balance: PeggedTokenBalance | null | undefined,
  pegType: string,
  timestamp: number
): number {
  if (!balance || typeof balance !== "object" || !balance.bridges) return 0;
  let removed = 0;
  for (const bridgeID of Object.keys(balance.bridges)) {
    if (!isHackedBridgeAt(bridgeID, timestamp)) continue;
    removed += bridgeTotal((balance.bridges as any)[bridgeID]);
    delete (balance.bridges as any)[bridgeID];
  }
  if (removed === 0) return 0;
  const current = (balance as any)[pegType];
  if (typeof current === "number") {
    let next = current - removed;
    if (next < 0 && next > -1e-6) next = 0;
    (balance as any)[pegType] = next;
  } else if (typeof current === "string") {
    (balance as any)[pegType] = (BigInt(current) - BigInt(Math.round(removed))).toString();
  }
  if (Object.keys(balance.bridges).length === 0) delete balance.bridges;
  return removed;
}

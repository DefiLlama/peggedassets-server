import { PeggedAssetIssuance } from "../../types";
import { HOUR } from "../../utils/date";
import { ChainDrop, findChainDrops, NON_CHAIN_KEYS } from "./chainDrops";

type ExtrapolatedChain = {
  chain: string;
  timestamp: number;
  blockedAt?: number;
  expiresAt?: number;
};

type ChainProtection = ExtrapolatedChain & { blockedAt: number; expiresAt: number };

const NON_BRIDGE_ISSUANCES = new Set(["minted", "unreleased", "circulating", "bridgedTo"]);

function getBridgeTotals(record: any, pegType: string) {
  const totals = new Map<string, number>();
  for (const [chain, balance] of Object.entries(record ?? {})) {
    if (NON_CHAIN_KEYS.has(chain) || !balance || typeof balance !== "object") continue;
    for (const [sourceChain, issuance] of Object.entries(balance)) {
      if (NON_BRIDGE_ISSUANCES.has(sourceChain)) continue;
      const amount = issuance?.[pegType];
      if (typeof amount === "number" && Number.isFinite(amount)) {
        totals.set(sourceChain, (totals.get(sourceChain) ?? 0) + amount);
      }
    }
  }
  return totals;
}

export type ExtrapolationMetadata = {
  extrapolated: boolean;
  extrapolatedChains: ExtrapolatedChain[];
};

export function protectChainDrops(
  prev: any,
  next: PeggedAssetIssuance,
  pegType: string,
  asset: { name: string; id: string },
  unixTimestamp: number,
  metadata: ExtrapolationMetadata,
): ChainDrop[] {
  const rawBridgeTotals = getBridgeTotals(next, pegType);
  const previousBridgeTotals = getBridgeTotals(prev, pegType);
  const rawCirculating = new Map(
    Object.entries(next).map(([chain, balance]) => [chain, balance?.circulating?.[pegType]]),
  );
  const drops = new Map(
    findChainDrops(prev, next, pegType, asset, unixTimestamp).map((d) => [d.chain, d]),
  );
  for (const [chain, balance] of Object.entries(next)) {
    if (NON_CHAIN_KEYS.has(chain) || !prev?.[chain] || drops.has(chain)) continue;
    const previous = prev[chain]?.circulating?.[pegType];
    const current = balance?.circulating?.[pegType];
    const failedIssuance = Object.values(balance).some((issuance) =>
      typeof issuance?.[pegType] !== "number" || !Number.isFinite(issuance[pegType]),
    );
    if (failedIssuance && typeof previous === "number" && Number.isFinite(previous) && previous > 0) {
      drops.set(chain, {
        chain,
        assetName: asset.name,
        assetId: asset.id,
        previous,
        current: typeof current === "number" && Number.isFinite(current) ? current : 0,
        missing: false,
      });
    }
  }
  const protections = new Map<string, ChainProtection>();
  for (const entry of prev?.extrapolatedChains ?? []) {
    if (Number.isFinite(entry.blockedAt) && Number.isFinite(entry.expiresAt)) {
      protections.set(entry.chain, entry);
      drops.set(entry.chain, {
        chain: entry.chain,
        assetName: asset.name,
        assetId: asset.id,
        previous: prev?.[entry.chain]?.circulating?.[pegType] ?? 0,
        current: next[entry.chain]?.circulating?.[pegType] ?? 0,
        missing: next[entry.chain] === undefined,
      });
    }
  }

  const alerts: ChainDrop[] = [];
  const retainedChains = new Set<string>();
  let retained = false;
  for (const [chain, drop] of drops) {
    const balance = next[chain];
    const validFetch = balance != null &&
      typeof balance.circulating?.[pegType] === "number" &&
      Number.isFinite(balance.circulating[pegType]) &&
      balance.circulating[pegType]! >= 0 &&
      Object.values(balance).every((issuance) =>
        typeof issuance?.[pegType] === "number" && Number.isFinite(issuance[pegType]),
      ) &&
      !metadata.extrapolatedChains.some((entry) => entry.chain === chain);
    const protection = protections.get(chain);

    if (protection && validFetch) {
      if (drop.current >= drop.previous / 2) {
        alerts.push({ ...drop, protection: "recovered" });
        continue;
      }
      if (unixTimestamp >= protection.expiresAt) {
        alerts.push({ ...drop, protection: "accepted" });
        continue;
      }
    }

    if (!prev?.[chain]) continue;
    const previousMetadata = prev.extrapolatedChains?.find((entry: ExtrapolatedChain) => entry.chain === chain);
    const entry: ChainProtection = protection ?? {
      chain,
      timestamp: previousMetadata?.timestamp ?? prev.SK,
      blockedAt: unixTimestamp,
      expiresAt: unixTimestamp + 12 * HOUR,
    };
    next[chain] = JSON.parse(JSON.stringify(prev[chain]));
    const index = metadata.extrapolatedChains.findIndex((item) => item.chain === chain);
    if (index < 0) metadata.extrapolatedChains.push(entry);
    else metadata.extrapolatedChains[index] = entry;
    metadata.extrapolated = true;
    retained = true;
    retainedChains.add(chain);

    if (!protection || unixTimestamp >= entry.expiresAt) {
      alerts.push({
        ...drop,
        protection: validFetch ? "held" : "fetch-failed",
        expiresAt: entry.expiresAt,
      });
    }
  }

  if (retained) {
    let addedDependency: boolean;
    do {
      addedDependency = false;
      const finalBridgeTotals = getBridgeTotals(next, pegType);
      const sources = new Set([...rawBridgeTotals.keys(), ...previousBridgeTotals.keys(), ...finalBridgeTotals.keys()]);
      for (const sourceChain of sources) {
        if (retainedChains.has(sourceChain) || !prev?.[sourceChain] || !next[sourceChain]) continue;
        const base = rawCirculating.get(sourceChain);
        if (typeof base !== "number" || !Number.isFinite(base)) continue;
        const adjusted = base + (rawBridgeTotals.get(sourceChain) ?? 0) - (finalBridgeTotals.get(sourceChain) ?? 0);
        if (adjusted >= 0) continue;

        next[sourceChain] = JSON.parse(JSON.stringify(prev[sourceChain]));
        retainedChains.add(sourceChain);
        metadata.extrapolated = true;
        if (!metadata.extrapolatedChains.some((entry) => entry.chain === sourceChain)) {
          metadata.extrapolatedChains.push({ chain: sourceChain, timestamp: prev.SK });
        }
        addedDependency = true;
      }
    } while (addedDependency);

    const finalBridgeTotals = getBridgeTotals(next, pegType);
    const sources = new Set([...rawBridgeTotals.keys(), ...previousBridgeTotals.keys(), ...finalBridgeTotals.keys()]);
    for (const sourceChain of sources) {
      const balance = next[sourceChain];
      if (!balance?.circulating) continue;
      const base = retainedChains.has(sourceChain)
        ? prev?.[sourceChain]?.circulating?.[pegType]
        : rawCirculating.get(sourceChain);
      if (typeof base !== "number" || !Number.isFinite(base)) continue;
      const baseBridged = retainedChains.has(sourceChain)
        ? previousBridgeTotals.get(sourceChain) ?? 0
        : rawBridgeTotals.get(sourceChain) ?? 0;
      const adjusted = base + baseBridged - (finalBridgeTotals.get(sourceChain) ?? 0);
      balance.circulating[pegType] = adjusted < 10 ** -6 ? 0 : adjusted;
    }

    for (const issuance of ["circulating", "unreleased"]) {
      next.totalCirculating[issuance] ??= {};
      next.totalCirculating[issuance][pegType] = Object.entries(next)
        .filter(([chain]) => !NON_CHAIN_KEYS.has(chain))
        .reduce((sum, [, balance]) => sum + (balance[issuance]?.[pegType] ?? 0), 0);
    }
  }
  return alerts;
}

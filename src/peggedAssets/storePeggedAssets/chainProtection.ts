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
  const drops = new Map(
    findChainDrops(prev, next, pegType, asset, unixTimestamp).map((d) => [d.chain, d]),
  );
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

    if (!protection || unixTimestamp >= entry.expiresAt) {
      alerts.push({
        ...drop,
        protection: validFetch ? "held" : "fetch-failed",
        expiresAt: entry.expiresAt,
      });
    }
  }

  if (retained) {
    for (const issuance of ["circulating", "unreleased"]) {
      next.totalCirculating[issuance] ??= {};
      next.totalCirculating[issuance][pegType] = Object.entries(next)
        .filter(([chain]) => !NON_CHAIN_KEYS.has(chain))
        .reduce((sum, [, balance]) => sum + (balance[issuance]?.[pegType] ?? 0), 0);
    }
  }
  return alerts;
}

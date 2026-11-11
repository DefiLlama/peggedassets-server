import * as sdk from "@defillama/sdk";

// SDK 5.0.250 has the Elysium RPC but lacks Kinetiq's label; Elysium is already elsm.
Object.assign(sdk.chainUtils.chainKeyToChainLabelMap, { elysium: "Elysium Kinetiq" });
Object.assign(sdk.chainUtils.chainLabelsToKeyMap, { "Elysium Kinetiq": "elysium" });

export function normalizeChain(chain: string) {
  if (chain.toLowerCase().replace(/-/g, " ") === "elysium kinetiq") return "elysium";
  return sdk.chainUtils.getChainKeyFromLabel(chain);
}

export const nonChains = [
  "PK",
  "SK",
  "tvl",
  "totalCirculating",
  "tvlPrev1Hour",
  "tvlPrev1Day",
  "tvlPrev1Week",
];

export function addToChains(chains: string[], chainDisplayName: string) {
  const knownChains = sdk.chainUtils.chainLabelsToKeyMap as Record<string, string>;
  if (knownChains[chainDisplayName] !== undefined && !chains.includes(chainDisplayName)) {
    chains.push(chainDisplayName);
  } else if (chainDisplayName.includes("-")) {
    const chainName = chainDisplayName.split("-")[0];
    addToChains(chains, chainName);
  }
}


import * as sdk from "@defillama/sdk";

export function normalizeChain(chain: string) {
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


import peggedAssets from "../../src/peggedData/peggedData";
import { chainCoingeckoIds, getChainDisplayName, nonChains, normalizeChain } from "../../src/utils/normalizeChain";
import { cache } from "../cache";
type balance = { [token: string]: number };

export function craftStablecoinChainsResponse() {
  const chainCirculating = {} as { [chain: string]: balance };
  let prices = cache.peggedPrices || cache.lastPrices?.prices || {}

  peggedAssets.map((pegged) => {
      const pegType = pegged.pegType;
      const lastBalances = cache.peggedAssetsData?.[pegged.id]?.lastBalance;
      if (lastBalances === undefined) {
        return;
      }
      const fallbackPrice = pegType === "peggedUSD" ? 1 : 0; // must be updated with each new pegType added
      const currentPrice = prices[pegged.gecko_id] || null;
      const price = currentPrice ? currentPrice : fallbackPrice;
      const processedNormalizedChains = new Set<string>();
      Object.entries(lastBalances).forEach(([chain, issuances]: any) => {
        if (nonChains.includes(chain)) return;
        const normalizedChain = normalizeChain(chain);
        if (nonChains.includes(normalizedChain)) return;
        if (processedNormalizedChains.has(normalizedChain)) return;
        processedNormalizedChains.add(normalizedChain);
        const chainName = getChainDisplayName(normalizedChain, true);
        if (nonChains.includes(chainName)) return;
        chainCirculating[chainName] = chainCirculating[chainName] || {};
        let circulating = issuances.circulating;
        chainCirculating[chainName][pegType] =
          chainCirculating[chainName][pegType] ?? 0;
        chainCirculating[chainName][pegType] += (circulating?.[pegType] ?? 0) * price;
      });
    })
  const chainData = Object.entries(chainCirculating)
    .map(([chainName, chainCirculating]) => ({
      gecko_id: chainCoingeckoIds[chainName]?.geckoId ?? null,
      totalCirculatingUSD: chainCirculating,
      tokenSymbol: chainCoingeckoIds[chainName]?.symbol ?? null,
      name: chainName,
    }))
  return chainData;
}

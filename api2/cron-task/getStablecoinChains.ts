import peggedAssets from "../../src/peggedData/peggedData";
import { getChainDisplayName, chainCoingeckoIds } from "../../src/utils/normalizeChain";
import { cache } from "../cache";
type balance = { [token: string]: number };

export function craftStablecoinChainsResponse() {
  const chainCirculating = {} as { [chain: string]: balance };
  let prices = cache.lastPrices.prices

  peggedAssets.map((pegged) => {
      const pegType = pegged.pegType;
      const lastBalances = cache.peggedAssetsData?.[pegged.id]?.lastBalance;
      if (lastBalances === undefined) {
        return;
      }
      let chainsAdded = 0;
      const fallbackPrice = pegType === "peggedUSD" ? 1 : 0; // must be updated with each new pegType added
      const currentPrice = prices[pegged.gecko_id] || null;
      const price = currentPrice ? currentPrice : fallbackPrice;
      Object.entries(lastBalances).forEach(([chain, issuances]: any) => {
        const chainName = getChainDisplayName(chain, true);
        if (chainCoingeckoIds[chainName] === undefined) {
          return;
        }
        chainCirculating[chainName] = chainCirculating[chainName] || {};
        let circulating = issuances.circulating;
        chainCirculating[chainName][pegType] =
          chainCirculating[chainName][pegType] ?? 0;
        chainCirculating[chainName][pegType] += circulating[pegType] * price;
        chainsAdded += 1;
      });
    })
  const chainData = Object.entries(chainCirculating).map(
    ([chainName, chainCirculating]) => ({
      gecko_id: chainCoingeckoIds[chainName]?.geckoId ?? null,
      totalCirculatingUSD: chainCirculating,
      tokenSymbol: chainCoingeckoIds[chainName]?.symbol ?? null,
      name: chainName,
    })
  );
  return chainData;
}

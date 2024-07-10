import { successResponse, wrap, IResponse } from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";
import fetch from "node-fetch";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getChainDisplayName, chainCoingeckoIds, nonChains } from "./utils/normalizeChain";
import { fetchPrices } from "./utils/fetchPrices";

type balance = { [token: string]: number };

export async function craftStablecoinChainsResponse({ peggedPrices }: { peggedPrices?: any } = {}) {
  const chainCirculating = {} as { [chain: string]: balance };
  
  let prices = await fetchPrices(peggedPrices);

  await Promise.all(
    peggedAssets.map(async (pegged) => {
      const pegType = pegged.pegType;
      const lastBalances = await getLastRecord(hourlyPeggedBalances(pegged.id));
      if (lastBalances === undefined) {
        return;
      }
      let chainsAdded = 0;
      const fallbackPrice = pegType === "peggedUSD" ? 1 : 0; // must be updated with each new pegType added
      const currentPrice = prices[pegged.gecko_id] || null;
      const price = currentPrice ? currentPrice : fallbackPrice;
      Object.entries(lastBalances).forEach(([chain, issuances]) => {
        const chainName = getChainDisplayName(chain, true);
        if (nonChains.includes(chainName)) {
          return;
        }
        // if (chainCoingeckoIds[chainName] === undefined) {
        //   return;
        // }
        chainCirculating[chainName] = chainCirculating[chainName] || {};
        let circulating = issuances.circulating;
        chainCirculating[chainName][pegType] =
          chainCirculating[chainName][pegType] ?? 0;
        chainCirculating[chainName][pegType] += (circulating?.[pegType] ?? 0) * price;
        chainsAdded += 1;
      });
    })
  );
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

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chainData = await craftStablecoinChainsResponse();
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);

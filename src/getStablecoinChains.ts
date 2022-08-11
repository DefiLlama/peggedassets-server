import { successResponse, wrap, IResponse } from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";
import fetch from "node-fetch";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getChainDisplayName, chainCoingeckoIds } from "./utils/normalizeChain";

type balance = { [token: string]: number };

export async function craftStablecoinChainsResponse() {
  const chainCirculating = {} as { [chain: string]: balance };
  let prices = {} as any;
  prices = await fetch(
    "https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/peggedPrices.json"
  )
    .then((res: any) => res.json())
    .catch(() => {
      throw new Error("Could not fetch pegged prices");
    });

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

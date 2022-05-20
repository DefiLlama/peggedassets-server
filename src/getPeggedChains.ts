import { successResponse, wrap, IResponse } from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";
import fetch from "node-fetch";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getChainDisplayName, chainCoingeckoIds } from "./utils/normalizeChain";

type balance = { [token: string]: number };

export async function craftPeggedChainsResponse() {
  const chainCirculating = {} as { [chain: string]: balance };
  const chainMcap = {} as { [chain: string]: number };
  let prices = {} as any;
  prices = await fetch(
    "https://cocoahomology-datasets.s3.amazonaws.com/peggedPrices.json"
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
      const price = prices[pegged.gecko_id] || null;
      Object.entries(lastBalances).forEach(([chain, issuances]) => {
        const chainName = getChainDisplayName(chain, true);
        if (chainCoingeckoIds[chainName] === undefined) {
          return;
        }
        chainCirculating[chainName] = chainCirculating[chainName] || {};
        let circulating = issuances.circulating;
        chainCirculating[chainName][pegType] =
          chainCirculating[chainName][pegType] ?? 0;
        chainCirculating[chainName][pegType] += circulating[pegType];
        chainsAdded += 1;

        chainMcap[chainName] = (chainMcap[chainName] ?? 0) + circulating[pegType] * price;
      });
      if (chainsAdded === 0) {
        const chainName = pegged.chain;
        chainCirculating[chainName] = chainCirculating[chainName] || {};
        let circulating = lastBalances.totalCirculating.circulating;
        chainCirculating[chainName][pegType] =
          chainCirculating[chainName][pegType] ?? 0;
        chainCirculating[chainName][pegType] += circulating[pegType];
      }
    })
  );
  const chainData = Object.entries(chainCirculating).map(
    ([chainName, chainCirculating]) => ({
      gecko_id: chainCoingeckoIds[chainName]?.geckoId ?? null,
      circulating: chainCirculating,
      mcap: chainMcap[chainName] ?? null,
      tokenSymbol: chainCoingeckoIds[chainName]?.symbol ?? null,
      cmcId: chainCoingeckoIds[chainName]?.cmcId ?? null,
      name: chainName,
    })
  );
  return chainData;
}

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chainData = await craftPeggedChainsResponse();
  return successResponse(chainData, 10 * 60); // 10 mins cache
};

export default wrap(handler);

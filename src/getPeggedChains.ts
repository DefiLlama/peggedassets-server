import { successResponse, wrap, IResponse } from "./utils/shared";
import peggedAssets from "./protocols/peggedData";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getChainDisplayName, chainCoingeckoIds } from "./utils/normalizeChain";

type balance = { [token: string]: number };

export async function craftPeggedChainsResponse() {
  const chainCirculating = {} as { [chain: string]: balance };
  await Promise.all(
    peggedAssets.map(async (pegged) => {
      const pegType = pegged.pegType;
      const lastBalances = await getLastRecord(hourlyPeggedBalances(pegged.id));
      if (lastBalances === undefined) {
        return;
      }
      let chainsAdded = 0;
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

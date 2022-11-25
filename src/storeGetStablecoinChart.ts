import { wrapScheduledLambda } from "./utils/shared/wrap";
import { store } from "./utils/s3";
import { craftChartsResponse } from "./getStablecoinChart";
import peggedData from "./peggedData/peggedData";
import {
  chainCoingeckoIds,
  normalizedChainReplacements,
  normalizeChain,
} from "./utils/normalizeChain";

const handler = async (_event: any) => {
  // store "all" chains charts for each stablecoin
  await Promise.all(
    peggedData.map(async (pegged) => {
      const id = pegged.id;
      const chart = await craftChartsResponse("all", id, undefined, false);
      const filename = `charts/all/${id}`;
      await store(filename, JSON.stringify(chart), true, false);
    })
  );

  // store "all" chains chart for all stablecoins
  const allChart = await craftChartsResponse(
    "all",
    undefined,
    undefined,
    false
  );
  await store("charts/all/all", JSON.stringify(allChart), true, false);

  // store each chain chart
  await Promise.all(
    [
      ...Object.keys(chainCoingeckoIds),
      ...Object.values(normalizedChainReplacements),
    ].map(async (chain) => {
      const normalizedChain = normalizeChain(chain);
      const chart = await craftChartsResponse(
        normalizedChain,
        undefined,
        undefined,
        false
      );
      if (chart.length) {
        const filename = `charts/${normalizedChain}`;
        await store(filename, JSON.stringify(chart), true, false);
      }
    })
  );
};

export default wrapScheduledLambda(handler);

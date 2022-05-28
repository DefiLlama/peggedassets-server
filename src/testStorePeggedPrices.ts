import peggedAssets from "./peggedData/peggedData";
import getCurrentPeggedPrice from "./adapters/peggedAssets/prices";
const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");

type Prices = {
  [coinGeckoId: string]: Number | null;
};

const test = async () => {
  let prices = {} as Prices;
  const { timestamp, chainBlocks } = await getCurrentBlocks();
      let pricePromises = peggedAssets.map(async (pegged) => {
        const price = await getCurrentPeggedPrice(pegged.gecko_id, chainBlocks, pegged.priceSource);
        prices[pegged.gecko_id] = price;
      });
      await Promise.all(pricePromises);
      console.log(JSON.stringify(prices))
};

test()

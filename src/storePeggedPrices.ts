import peggedAssets from "./protocols/peggedData";
import getCurrentPeggedPrice from "./DefiLlama-Adapters/peggedAssets/prices";
const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
import { wrapScheduledLambda } from "./utils/shared/wrap";
import { store } from "./utils/s3";

type Prices = {
  [coinGeckoId: string]: Number;
};

const handler = async (_event: any) => {
  let prices = {} as Prices;
  const { chainBlocks } = await getCurrentBlocks();
  for (let i = 0; i < 5; i++) {
    try {
      let pricePromises = peggedAssets.map(async (pegged) => {
        const price = await getCurrentPeggedPrice(pegged.gecko_id, chainBlocks);
        if (typeof price !== "number") {
          throw new Error(`price is NaN. Instead it is ${typeof price}`)
        }
        prices[pegged.gecko_id] = price;
      });
      await Promise.all(pricePromises);
      await store("peggedPrices.json", JSON.stringify(prices));
    } catch (e) {
      if (i >= 5) {
        throw e;
      } else {
        console.error(e);
        continue;
      }
    }
  }
};

export default wrapScheduledLambda(handler);

import peggedAssets from "./peggedData/peggedData";
import getCurrentPeggedPrice from "./adapters/peggedAssets/prices";

type Prices = {
  [coinGeckoId: string]: Number | null;
};

const test = async () => {
  let prices = {} as Prices;
  let pricePromises = peggedAssets.map(async (pegged) => {
    const price = await getCurrentPeggedPrice(
      pegged.gecko_id,
      pegged.priceSource
    );
    console.log(pegged.gecko_id);
    prices[pegged.gecko_id] = price;
  });
  await Promise.all(pricePromises);
  console.log(JSON.stringify(prices));
};

test();

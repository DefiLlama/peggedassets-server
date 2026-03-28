import peggedAssets from "./peggedData/peggedData";
import { getPrices } from "./adapters/peggedAssets/prices";

const test = async () => {
  const tokens = peggedAssets.map((pegged) =>pegged.gecko_id);
  await getPrices(peggedAssets).then((res) => {
    tokens.forEach((token) => {
      if (!res[token]) {
        console.log(token, "not found");
      }
    })
  })
  return;
};

test().then(() => process.exit(0));

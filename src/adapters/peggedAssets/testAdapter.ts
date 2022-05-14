const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
import { ChainBlocks } from "./peggedAsset.type";
import adapter from "./terrausd/index";

const test = async () => {
  let { timestamp, ethBlock, chainBlocks } = await getCurrentBlocks();
  console.log(timestamp, "chainBlocks");
  for (let chain of Object.keys(adapter)) {
    const results = await result(timestamp, ethBlock, chainBlocks, chain);
    console.log(JSON.stringify({ [chain]: results }));
  }
};

const result = async (
  timestamp: number,
  ethBlock: number,
  chainBlocks: ChainBlocks,
  chain: string
) => {
  let results = Object.entries(adapter[chain]).map(
    async ([issuanceType, issuanceFunction]) => {
      let resolvedFunc = await issuanceFunction;
      if (typeof resolvedFunc !== "function") {
        return { [`${issuanceType}`]: 0 };
      }
      let total = await resolvedFunc(timestamp, ethBlock, chainBlocks);
      //console.log(total);
      if (Object.keys(total).length !== 0) {
        return { [`${issuanceType}`]: total };
      } else return { [`${issuanceType}`]: 0 };
    }
  );
  return Promise.all(results);
};

test();

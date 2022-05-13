import { storePeggedAsset } from "./getAndStorePeggedAssets";
import adapter from "../../DefiLlama-Adapters/peggedAssets/tether";
const { getCurrentBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
import peggedAssets from "../../protocols/peggedData";

const test = async () => {
  let { timestamp, ethBlock, chainBlocks } = await getCurrentBlocks();
  storePeggedAsset(
    timestamp,
    ethBlock,
    chainBlocks,
    peggedAssets[0],
    adapter
  );
};

test();

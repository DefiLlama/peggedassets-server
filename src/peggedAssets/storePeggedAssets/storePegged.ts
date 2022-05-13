import { storePeggedAsset } from "./getAndStorePeggedAssets";
import { getCurrentBlocks } from "@defillama/sdk/build/computeTVL/blocks";
import peggedAssets from "../../protocols/peggedData";
import { importAdapter } from "../utils/importAdapter";

const maxRetries = 4;

async function iteratePeggedAssets(peggedIndexes: number[]) {
  const { timestamp, ethereumBlock, chainBlocks } = await getCurrentBlocks();
  const actions = peggedIndexes
    .map((idx) => peggedAssets[idx])
    .map((peggedAsset) => {
      const adapterModule = importAdapter(peggedAsset);
      return storePeggedAsset(
        timestamp,
        ethereumBlock,
        chainBlocks,
        peggedAsset,
        adapterModule,
        maxRetries,
        true,
      );
    });
  await Promise.all(actions);
  return;
}

export default async (peggedIndexes: number[]) => {
  await iteratePeggedAssets(peggedIndexes);
};

import { storePeggedAsset } from "./getAndStorePeggedAssets";
import { getCurrentBlocks } from "./blocks";
import peggedAssets from "../../peggedData/peggedData";
import { importAdapter } from "../utils/importAdapter";

const maxRetries = 4;

const timeout = (prom: any, time: number, peggedID: string) =>
  Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]).catch(
    (err) => {
      console.error(`Could not store peggedAsset ${peggedID}`, err);
    }
  );

async function iteratePeggedAssets(peggedIndexes: number[]) {
  const { timestamp, ethereumBlock, chainBlocks } = await timeout(
    getCurrentBlocks(),
    60000,
    "get blocks"
  );
  if (timestamp) {
    const actions = peggedIndexes
      .map((idx) => peggedAssets[idx])
      .map((peggedAsset) => {
        const adapterModule = importAdapter(peggedAsset);
        // times out after 60 seconds
        return timeout(
          storePeggedAsset(
            timestamp,
            ethereumBlock,
            chainBlocks,
            peggedAsset,
            adapterModule,
            maxRetries,
            true
          ),
          60000,
          peggedAsset.gecko_id
        );
      });
    await Promise.all(actions);
  }
  return;
}

export default async (peggedIndexes: number[]) => {
  await iteratePeggedAssets(peggedIndexes);
};

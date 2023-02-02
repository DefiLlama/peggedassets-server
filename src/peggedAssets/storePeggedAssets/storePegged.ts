import { storePeggedAsset } from "./getAndStorePeggedAssets";
import { getCurrentBlocks } from "./blocks";
import peggedAssets from "../../peggedData/peggedData";
import { importAdapter } from "../utils/importAdapter";
import { executeAndIgnoreErrors } from "./errorDb";
import { getCurrentUnixTimestamp } from "../../utils/date";

const maxRetries = 4;
const chainBlocks = undefined; // not needed by any adapters

const timeout = (prom: any, time: number, peggedID: string) =>
  Promise.race([prom, new Promise((_r, rej) => setTimeout(rej, time))]).catch(
    async (err) => {
      console.info("storepegged timedout");
      await executeAndIgnoreErrors("INSERT INTO `errors` VALUES (?, ?, ?)", [
        getCurrentUnixTimestamp(),
        peggedID,
        String(err),
      ]);
      console.error(`Could not store peggedAsset ${peggedID}`, err);
    }
  );

async function iteratePeggedAssets(peggedIndexes: number[]) {
  const { timestamp, ethereumBlock } = await timeout(
    getCurrentBlocks(),
    45000,
    "getBlocks"
  );
  if (timestamp) {
    const actions = peggedIndexes
      .map((idx) => peggedAssets[idx])
      .map(async (peggedAsset) => {
        const adapterModule = importAdapter(peggedAsset);
        // times out after 60 seconds
        return await timeout(
          storePeggedAsset(
            timestamp,
            ethereumBlock,
            chainBlocks,
            peggedAsset,
            adapterModule,
            maxRetries,
            peggedAsset.delisted ? false : true
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

import peggedAssets from "../../peggedData/peggedData";
import { getCurrentUnixTimestamp } from "../../utils/date";
import { importAdapter } from "../utils/importAdapter";
import { executeAndIgnoreErrors } from "./errorDb";
import { storePeggedAsset } from "./getAndStorePeggedAssets";

const maxRetries = 3;
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

const stubFn = () => ({})

async function iteratePeggedAssets(peggedIndexes: number[]) {
  const timestamp = getCurrentUnixTimestamp();
  const ethereumBlock = undefined;
  if (timestamp) {
    // console.log("Storing pegged assets", timestamp, peggedIndexes.map((i) => peggedAssets[i].name));
    const actions = peggedIndexes
      .map((idx) => peggedAssets[idx])
      .map(async (peggedAsset) => {
        if (peggedAsset.delisted) {
          console.log("Skipping delisted pegged asset", peggedAsset.name);
          return;
        }
        if (peggedAsset.deadFrom) {
          console.log("Skipping dead pegged asset", peggedAsset.name);
          return;
        }
        if (peggedAsset.gecko_id === "bitcoin-usd-btcfi") 
          peggedAsset.pegType = "peggedUSD";
        const adapterModule = importAdapter(peggedAsset);
        if (!adapterModule) console.log("No adapter found for", peggedAsset.name, peggedAsset);

        Object.values(adapterModule).forEach((obj: any) => {
          if (!obj.minted) obj.minted = stubFn
          if (!obj.unreleased) obj.unreleased = stubFn
        })
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
          5 * 60 * 1000,
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

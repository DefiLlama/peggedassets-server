import axios from "axios";
const retry = require("async-retry");
import { Balances, ChainBlocks } from "../peggedAsset.type";
import { sumSingleBalance } from "./generalUtil";

// api.mixin.one can accept the connection and never answer, so without a timeout
// the call hangs until the store run gives up on the whole chain
const fetchMixinSupply = async (assetId: string) => {
  const res = await retry(
    async (_bail: any) =>
      await axios.get(`https://api.mixin.one/network/assets/${assetId}`, { timeout: 15000 }),
    { retries: 2 }
  );
  return +res.data.data.amount;
};

export const mixinSupply = async (
  assetIds: string[],
  bridgedFromChain: string
) => {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    for (let assetId of assetIds) {
      const supply = await fetchMixinSupply(assetId);
      sumSingleBalance(
        balances,
        "peggedUSD",
        supply,
        assetId,
        false,
        bridgedFromChain
      );
    }
    return balances;
  };
};

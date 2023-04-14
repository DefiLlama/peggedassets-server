import axios from "axios";
import retry from "async-retry";
import { Balances, ChainBlocks } from "../peggedAsset.type";
import { sumSingleBalance } from "./generalUtil";

const fetchMixinSupply = async (assetId: string) => {
  const res = await retry(
    async (_bail: any) =>
      await axios.get(`https://api.mixin.one/network/assets/${assetId}`)
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
      console.info(`mixin success ${assetId} supply: ${supply}`);
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
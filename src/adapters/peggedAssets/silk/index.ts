import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

// There appears to be no explorer API that can give total supply; this endpoint was provided by dev.
async function silkMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://ruvzuawwz7.execute-api.us-east-1.amazonaws.com/prod-analytics-v1/silk"
        )
    );
    const totalSupply = res?.data?.totalUsd;
    const supply = totalSupply / 10 ** decimals;
    sumSingleBalance(balances, "peggedVAR", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  secret: {
    minted: silkMinted(0),
  },
};

export default adapter;

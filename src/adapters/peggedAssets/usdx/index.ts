const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
};

// If there is any Mintscan (or other) API that can be used, it should replace this.
async function kavaMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://api.kava.io/vesting/circulatingsupplyusdx"
        )
    );
    const supply = res.data
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  kava: {
    minted: kavaMinted(),
    unreleased: async () => ({}),
  },
};

export default adapter;

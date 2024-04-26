import { sumSingleBalance } from "../helper/generalUtil";
import { osmosisSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");


const chainContracts: ChainContracts = {
  osmosis: {
    bridgedFromComdex: [
      "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
    ],
  },
};

async function compositeMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://rest.comdex.one/cosmos/bank/v1beta1/supply/ucmst"
        )
    );

    const supply = res?.data?.amount?.amount / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  comdex: {
    minted: compositeMinted(6),
  },
  osmosis: {
    comdex: osmosisSupply(
      chainContracts.osmosis.bridgedFromComdex,
      6,
      "Comdex"
    ),
  },
};

export default adapter;

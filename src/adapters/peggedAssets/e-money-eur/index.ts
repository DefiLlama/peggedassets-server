import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");


const chainContracts: ChainContracts = {
  osmosis: {
    bridgedFromEmoney: [
      "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
    ],
  },
};

export async function osmosisAmount(
  tokens: string[],
  decimals: number,
  bridgedFromChain: string
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let token of tokens) {
      const res = await retry(
        async (_bail: any) =>
          await axios.get(
            `https://lcd.osmosis.zone/osmosis/superfluid/v1beta1/supply?denom=${token}`
          )
      );
      sumSingleBalance(
        balances,
        "peggedUSD",
        parseInt(res.data.amount.amount) / 10 ** decimals,
        token,
        false,
        bridgedFromChain
      );
    }
    return balances;
  };
}

async function emoneyMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://rest.cosmos.directory/emoney/cosmos/bank/v1beta1/supply/eeur"
        )
    );
    const eeurInfo = res?.data?.amount;
    const supply = eeurInfo?.amount / 10 ** decimals;
    sumSingleBalance(balances, "peggedEUR", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  /*emoney: {
    minted: emoneyMinted(6),
  },*/
  osmosis: {
    emoney: osmosisAmount(
      chainContracts.osmosis.bridgedFromEmoney,
      6,
      "emoney"
    ),
  },
};

export default adapter;

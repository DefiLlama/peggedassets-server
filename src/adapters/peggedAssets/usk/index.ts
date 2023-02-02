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

const chainContracts: ChainContracts = {};

// There appears to be no explorer API that can give total supply; this endpoint was provided by dev.
async function kujiraMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://lcd.kaiyo.kujira.setten.io/cosmos/bank/v1beta1/supply"
        )
    );
    const kujiraTokenInfo = res?.data?.supply;
    const uskInfo = kujiraTokenInfo.filter(
      (obj: any) =>
        obj.denom ===
        "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk"
    );
    const supply = uskInfo?.[0].amount / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  kujira: {
    minted: kujiraMinted(6),
    unreleased: async () => ({}),
  },
};

export default adapter;

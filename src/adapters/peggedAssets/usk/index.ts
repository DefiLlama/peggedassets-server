import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
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
          "https://rest.cosmos.directory/kujira/cosmos/bank/v1beta1/supply/by_denom?denom=factory%2Fkujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7%2Fuusk"
        )
    );
    const uskInfo = res?.data?.amount;
    const supply = uskInfo?.amount / 10 ** decimals;
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

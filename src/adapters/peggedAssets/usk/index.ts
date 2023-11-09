import { sumSingleBalance } from "../helper/generalUtil";
import { osmosisSupply } from "../helper/getSupply";
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

const chainContracts: ChainContracts = {
  osmosis: {
    bridgedFromKujira: ["ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC"],
  },
};

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
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    kujira: osmosisSupply(chainContracts.osmosis.bridgedFromKujira, 6, "Kujira"),
  }
};

export default adapter;

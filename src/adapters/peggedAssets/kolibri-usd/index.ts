const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { getTotalSupply as tezosGetTotalSupply } from "../helper/tezos";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  tezos: {
    issued: ["KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV"],
  },
};

async function tezosMinted(tokenID: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tezosGetTotalSupply(tokenID);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  tezos: {
    minted: tezosMinted(chainContracts.tezos.issued[0]),
    unreleased: async () => ({}),
  },
};

export default adapter;

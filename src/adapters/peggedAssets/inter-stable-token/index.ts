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
    bridgedFromAgoric: [
      "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
    ],
  },
};

async function agoricMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const res = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://rest.cosmos.directory/agoric/cosmos/bank/v1beta1/supply/by_denom?denom=uist"
        )
    );
    const istInfo = res?.data?.amount;
    const supply = istInfo?.amount / 10 ** decimals;
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  agoric: {
    minted: agoricMinted(6),
    unreleased: async () => ({}),
  },
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    agoric: osmosisSupply(
      chainContracts.osmosis.bridgedFromAgoric,
      6,
      "Agoric"
    ),
  },
};

export default adapter;

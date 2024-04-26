const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    issued: string;
    unreleased: string[];
  };
};

const chainContracts: ChainContracts = {
  polygon: {
    issued: "0xA0e4c84693266a9d3BBef2f394B33712c76599Ab",
    unreleased: [],
  },
  linea: {
    issued: "0x3f817b28da4940f018c6b5c0a11c555ebb1264f9",
    unreleased: [],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: chainContracts[chain].issued,
        block: _chainBlocks?.[chain],
        chain: chain,
      })
    ).output;
    sumSingleBalance(
      balances,
      "peggedEUR",
      totalSupply / 10 ** decimals,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: chainMinted("polygon", 18),
  },
  linea: {
    minted: chainMinted("linea", 18),
  },
};

export default adapter;

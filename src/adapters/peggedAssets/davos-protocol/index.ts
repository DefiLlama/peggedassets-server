const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";

import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  polygon: {
    issued: ["0xec38621e72d86775a89c7422746de1f52bba5320"],
  },
  ethereum: {
    issued: ["0xa48F322F8b3edff967629Af79E027628b9Dd1298"],
  },
  arbitrum: {
    issued: ["0x8ec1877698acf262fe8ad8a295ad94d6ea258988"],
  },
  optimism: {
    issued: ["0xb396b31599333739a97951b74652c117be86ee1d"],
  },
  bsc: {
    issued: ["0x8ec1877698acf262fe8ad8a295ad94d6ea258988"],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;

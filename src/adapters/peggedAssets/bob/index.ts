const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
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
    issued: ["0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B"],
  },
  optimism: {
    issued: ["0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b"],
  },
  ethereum: {
    issued: ["0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b"],
  },
  bsc: {
    issued: ["0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B"]
  }
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
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: async () => ({}),
  }
};

export default adapter;

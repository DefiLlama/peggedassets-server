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
  ethereum: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
  polygon: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"]
  },
  optimism: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"]
  },
  celo: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"]
  },
  arbitrum: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"]
  },
  base: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"]
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
  celo: {
    minted: chainMinted("celo", 18),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: async () => ({}),
  },
  base: {
    minted: chainMinted("base", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;
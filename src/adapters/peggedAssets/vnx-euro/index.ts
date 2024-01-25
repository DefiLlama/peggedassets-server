const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x6ba75d640bebfe5da1197bb5a2aff3327789b5d3"],
  },
  polygon: {
    issued: ["0xE4095d9372E68d108225c306A4491cacfB33B097"],
  },
  avax: {
    issued: ["0x7678e162f38ec9ef2bfd1d0aaf9fd93355e5fa0b"],
  },
  solana: {
    issued: ["C4Kkr9NZU3VbyedcgutU6LKmi6MKz81sx6gRmk5pX519"],
  },
  q: {
    issued: ["0x513f99dee650f529d7c65bb5679f092b64003520"],
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
        "peggedEUR",
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
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: async () => ({}),
  },
  q: {
    minted: chainMinted("q", 18),
    unreleased: async () => ({}),
  },
  solana: {
    minted: solanaMintedOrBridged(chainContracts.solana.issued),
    unreleased: async () => ({}),
  },
};

export default adapter;

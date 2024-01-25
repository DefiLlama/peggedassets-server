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
    issued: ["0x79d4f0232A66c4c91b89c76362016A1707CFBF4f"],
  },
  polygon: {
    issued: ["0xCdB3867935247049e87c38eA270edD305D84c9AE"],
  },
  avax: {
    issued: ["0x228a48df6819ccc2eca01e2192ebafffdad56c19"],
  },
  solana: {
    issued: ["AhhdRu5YZdjVkKR3wbnUDaymVQL2ucjMQ63sZ3LFHsch"],
  },
  q: {
    issued: ["0x65b9d36281e97418793f3430793f88440dab68d7"],
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
        "peggedCHF",
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
    minted: solanaMintedOrBridged(chainContracts.solana.issued, "peggedCHF"),
    unreleased: async () => ({}),
  },
};
export default adapter;

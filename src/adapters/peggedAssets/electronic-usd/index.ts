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
  ethereum: {
    issued: ["0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F"],
  },
  base: {
    bridgedFromETH: ["0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4"],
  },
  arbitrum: {
    bridgedFromETH: ["0x12275DCB9048680c4Be40942eA4D92c74C63b844"],
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
    base: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("base", 18, chainContracts.base.bridgedFromETH, "base"),
  },
    arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("arbitrum", 18, chainContracts.arbitrum.bridgedFromETH),
  },
};

export default adapter;

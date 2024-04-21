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
    issued: ["0x0E573Ce2736Dd9637A0b21058352e1667925C7a8"],
  },
  bsc: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  optimism: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  arbitrum: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  avax: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  polygon: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  tomochain: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
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
    minted: chainMinted("ethereum", 6),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromETH),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: bridgedSupply(
      "optimism",
      6,
      chainContracts.optimism.bridgedFromETH
    ),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: bridgedSupply(
      "arbitrum",
      6,
      chainContracts.arbitrum.bridgedFromETH
    ),
    unreleased: async () => ({}),
  },
  polygon: {
    minted: bridgedSupply("polygon", 6, chainContracts.polygon.bridgedFromETH),
    unreleased: async () => ({}),
  },
  tomochain: {
    minted: bridgedSupply(
      "tomochain",
      6,
      chainContracts.tomochain.bridgedFromETH
    ),
    unreleased: async () => ({}),
  },
  avax: {
    minted: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromETH),
    unreleased: async () => ({}),
  },
};

export default adapter;

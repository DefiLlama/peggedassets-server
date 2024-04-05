const sdk = require("@defillama/sdk");
import axios from "axios";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  supplyInEthereumBridge,
  solanaMintedOrBridged,
  osmosisSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import { call as nearCall } from "../llama-helper/near";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

// all multichain
const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x853d955acef822db058eb8505911ed77f175b99e"],
  },
  bsc: {
    bridgedFromETH: ["0x90c97f71e18723b0cf0dfa30ee176ab653e89f40"],
  },
  avax: {
    bridgedFromETH: ["0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64"],
  },
  arbitrum: {
    bridgedFromETH: ["0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F"],
  },
  aurora: {
    bridgedFromETH: ["0xE4B9e004389d91e4134a28F19BD833cBA1d994B6"],
  },
  boba: {
    bridgedFromETH: ["0x7562F525106F5d54E891e005867Bf489B5988CD9"],
  },
  fantom: {
    bridgedFromETH: ["0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355"],
  },
  evmos: {
    bridgedFromETH: ["0xE03494D0033687543a80c9B1ca7D6237F2EA8BD8"],
  },
  harmony: {
    bridgedFromETH: ["0xFa7191D292d5633f702B0bd7E3E3BcCC0e633200"],
  },
  moonbeam: {
    bridgedFromETH: ["0x322E86852e492a7Ee17f28a78c663da38FB33bfb"],
  },
  moonriver: {
    bridgedFromETH: ["0x1A93B23281CC1CDE4C4741353F3064709A16197d"],
  },
  optimism: {
    bridgedFromETH: ["0x2E3D870790dC77A83DD1d18184Acc7439A53f475"],
  },
  polygon: {
    bridgedFromETH: ["0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89"],
  },
  solana: {
    bridgedFromETH: ["FR87nWEUxVgerFGhZM8Y4AggKGLnaXswr1Pd8wZ4kZcp"],
  },
  zksync: {
    bridgeOnETH: ["0xaBEA9132b05A70803a4E85094fD0e1800777fBEF"],
  },
  milkomeda: {
    bridgedFromETH: ["0x362233F1eF554Ca08555Ca191b4887c2C3132834"], // wormhole: not canonical FRAX
  },
  everscale: {
    bridgeOnETH: ["0xF2403a61C7A97a1a1b94A225173F6dD03614B907"], // octus: not canonical FRAX
  },
  dogechain: {
    bridgedFromETH: ["0xf27Ee99622C3C9b264583dACB2cCE056e194494f"], // multichain
  },
  osmosis: {
    bridgedFromETH: [
      "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
    ], // axelar
  },
};

/*
Frax works differently from other stables, bridged amounts don't matter.
See: https://docs.frax.finance/cross-chain/bridge
*/


async function fraxMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    try {
      const response = await axios.get(
        "https://api.frax.finance/v2/frax/balance-sheet/latest"
      );
      const data = response.data;

      // Calculate total supply
      const totalSupply = (data.totalLiabilities - data.categorySummaryUsd["asset:owned:frax"]) - data.totalLockedLiquidity
      const supply = totalSupply;
      sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
      return balances;
    } catch (error) {
      console.error("Error fetching supply data:", error);
    }
    return balances;
  };
}

async function nearBridged(address: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await nearCall(address, "ft_total_supply");
    sumSingleBalance(
      balances,
      "peggedUSD",
      supply / 10 ** decimals,
      address,
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: fraxMinted(),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("avax", 18, chainContracts.avax.bridgedFromETH),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromETH),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  evmos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("evmos", 18, chainContracts.evmos.bridgedFromETH),
  },
  near: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: nearBridged("853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near", 18),
  },
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromETH
    ),
  },
  moonbeam: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonbeam",
      18,
      chainContracts.moonbeam.bridgedFromETH
    ),
  },
  moonriver: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "moonriver",
      18,
      chainContracts.moonriver.bridgedFromETH
    ),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
  },
  zksync: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      18
    ),
  },
  milkomeda: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "milkomeda",
      18,
      chainContracts.milkomeda.bridgedFromETH
    ),
  },
  everscale: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.everscale.bridgeOnETH[0],
      18
    ),
  },
  dogechain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "dogechain",
      18,
      chainContracts.dogechain.bridgedFromETH
    ),
  },
  osmosis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: osmosisSupply(
      chainContracts.osmosis.bridgedFromETH,
      18,
      "Axelar"
    ),
  },
};

export default adapter;

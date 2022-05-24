const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, terraSupply } from "../helper/getSupply";
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
    issued: ["0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3"],
  },
  polygon: {
    bridgedFromETH: ["0x49a0400587A7F65072c87c4910449fDcC5c47242"], // multichain/abracadabra
  },
  avax: {
    bridgedFromETH: ["0x130966628846BFd36ff31a822705796e8cb8C18D"], // multichain/abracadabra
  },
  arbitrum: {
    bridgedFromETH: ["0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a"], // multichain/abracadabra
  },
  fantom: {
    bridgedFromETH: ["0x82f0b8b456c1a451378467398982d4834b6829c1"], // multichain/abracadabra
  },
  bsc: {
    bridgedFromETH: ["0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba"], // multichain/abracadabra
  },
  moonriver: {
    bridgedFromETH: ["0x0cae51e1032e8461f4806e26332c030e34de3adb"], // multichain
  },
  boba: {
    bridgedFromETH: ["0x218c3c3D49d0E7B37aff0D8bB079de36Ae61A4c0"], // multichain
  },
  metis: {
    bridgedFromETH: ["0x44Dd7C98885cD3086E723B8554a90c9cC4089C4C"], // multichain
  },
  solana: {
    bridgedFromETH: [
      "HRQke5DKdDo3jV7wnomyiM8AA3EzkVnxMDdo2FQ5XUe1", // wormhole, 0 supply?
      "CYEFQXzQM6E5P8ZrXgS7XMSwU3CiqHMMyACX4zuaA2Z4", // allbridge, no longer available in bridge?
    ], 
  },
  terra: {
    bridgedFromETH: ["terra15a9dr3a2a2lj5fclrw35xxg9yuxg0d908wpf2y"], // wormhole
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
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", totalSupply / 10 ** decimals, "issued", false);
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
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH
    ),
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
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
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
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("metis", 18, chainContracts.metis.bridgedFromETH),
  },
  /* This appears not to be accessible anymore, so not adding it.
  terra: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: terraSupply(chainContracts.terra.bridgedFromETH, 8),
  },
  */
};

export default adapter;

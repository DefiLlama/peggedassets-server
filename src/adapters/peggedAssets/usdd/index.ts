const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
import {
  getTotalSupply as tronGetTotalSupply, // NOTE THIS DEPENDENCY
} from "../helper/tron";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  tron: {
    issued: ["TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn"],
  },
  bittorrent: {
    bridgedFromTron: ["0x17F235FD5974318E4E2a5e37919a209f7c37A6d1"],
  },
  ethereum: {
    bridgedFromBttc: ["0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6"],
    reserves: ["0x9277a463A508F45115FdEaf22FfeDA1B16352433"],
  },
  bsc: {
    bridgedFromBttc: ["0xd17479997f34dd9156deef8f95a52d81d265be9c"],
    reserves: ["0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9"],
  },
};

async function tronMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await tronGetTotalSupply(
      chainContracts["tron"].issued[0]
    );
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

async function ethereumBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: "0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6",
        block: _chainBlocks?.["ethereum"],
        chain: "ethereum",
      })
    ).output;

    const reserve = (
      await sdk.api.erc20.balanceOf({
        target: "0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6",
        owner: "0x9277a463A508F45115FdEaf22FfeDA1B16352433", // reserve contract for USDD on Ethereum
        block: _chainBlocks?.["ethereum"],
        chain: "ethereum",
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      (totalSupply - reserve) / 10 ** 18,
      "0xd17479997f34dd9156deef8f95a52d81d265be9c",
      true
    );
    return balances;
  };
}

async function bscBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    const totalSupply = (
      await sdk.api.abi.call({
        abi: "erc20:totalSupply",
        target: "0xd17479997f34dd9156deef8f95a52d81d265be9c",
        block: _chainBlocks?.["bsc"],
        chain: "bsc",
      })
    ).output;

    const reserve = (
      await sdk.api.erc20.balanceOf({
        target: "0xd17479997F34dd9156Deef8F95A52D81D265be9c",
        owner: "0xCa266910d92a313E5F9eb1AfFC462bcbb7d9c4A9", // reserve contract for USDD on BSC
        block: _chainBlocks?.["bsc"],
        chain: "bsc",
      })
    ).output;

    sumSingleBalance(
      balances,
      "peggedUSD",
      (totalSupply - reserve) / 10 ** 18,
      "0xd17479997f34dd9156deef8f95a52d81d265be9c",
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  tron: {
    minted: tronMinted(),
    unreleased: async () => ({}),
  },
  bittorrent: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    tron: bridgedSupply(
      "bittorrent",
      18,
      chainContracts.bittorrent.bridgedFromTron
    ),
  },
  ethereum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bittorrent: ethereumBridged(),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    bittorrent: bscBridged(),
  },
};

export default adapter;

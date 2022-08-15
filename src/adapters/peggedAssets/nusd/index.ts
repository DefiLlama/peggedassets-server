const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  getTotalSupply as ontologyGetTotalSupply,
  getBalance as ontologyGetBalance,
} from "../helper/ontology";
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
    issued: ["0x57ab1ec28d129707052df4df418d58a2d46d5f51"],
  },
  arbitrum: {
    bridgedFromETH: ["0xa970af1a584579b618be4d69ad6f73459d112f95"],
  },
  optimism: {
    issued: ["0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"],
  },
  fantom: {
    bridgedFromETH: ["0x0e1694483ebb3b74d3054e383840c6cf011e518e"], // multichain
  },
  ontology: {
    bridgedFromETH: ["17a58a4a65959c2f567e5063c560f9d09fb81284"], // poly network
    unreleased: ["AVaijxNJvAXYdNMVSYAfT8wVTh8tNHcTBM"],
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

async function ontologyBridged() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const polyDAIAddress = chainContracts.ontology.bridgedFromETH[0];
    const polyDAIReserveAddress = chainContracts.ontology.unreleased[0];
    const polyNetworkSupply = await ontologyGetTotalSupply(
      polyDAIAddress,
      "oep4"
    );
    const polyNetworkReserve = await ontologyGetBalance(
      polyDAIAddress,
      "oep4",
      polyDAIReserveAddress
    );
    sumSingleBalance(
      balances,
      "peggedUSD",
      polyNetworkSupply - polyNetworkReserve,
      polyDAIAddress,
      true
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
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
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: async () => ({}),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("fantom", 18, chainContracts.fantom.bridgedFromETH),
  },
  ontology: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: ontologyBridged(),
  },
};

export default adapter;

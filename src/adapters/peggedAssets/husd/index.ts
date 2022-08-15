const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, solanaMintedOrBridged } from "../helper/getSupply";
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
  ethereum: {
    issued: ["0xdF574c24545E5FfEcb9a659c229253D4111d87e1"],
  },
  tron: {
    issued: ["TL2FiXffdjG5Ep8eqPN6ouLyydvmgoR95h"],
  },
  heco: {
    issued: ["0x0298c2b32eae4da002a15f36fdf7615bea3da047"],
  },
  elastos: {
    bridgedFromHeco: ["0xF9Ca2eA3b1024c0DB31adB224B407441bECC18BB"], // glide/shadowtokens
  },
  solana: {
    bridgedFromETH: [
      "7VQo3HFLNH5QqGtM8eC3XQbPkJUu7nS9LeGWjerRh5Sw", // wormhole v2
      "BybpSTBoZHsmKnfxYG47GDhVPKrnEKX31CScShbrzUhX", // wormhole v1
    ], 
  },
};
/*
Sora address: 0x008ba21aa988b21e86d5b25ed9ea690d28a6ba6c5ba9037424c215fd5b193c32
*/

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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 8),
    unreleased: async () => ({}),
  },
  tron: {
    minted: tronMinted(),
    unreleased: async () => ({}),
  },
  heco: {
    minted: chainMinted("heco", 8),
    unreleased: async () => ({}),
  },
  elastos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    heco: bridgedSupply("elastos", 8, chainContracts.elastos.bridgedFromHeco),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH)
  }
};

export default adapter;

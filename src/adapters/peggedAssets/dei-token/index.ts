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
  fantom: {
    issued: ["0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3"],
    reserves: [
      "0x958c24d5cdf94faf47cf4d66400af598dedc6e62", // DEIBonder
      "0x0b99207afbb08ec101b5691e7d5c6faadd09a89b", // multisig
      "0x68c102aba11f5e086c999d99620c78f5bc30ecd8" // scDEI, not sure if this counts as circulating/uncirculating but it is subtracted in the official DEI dashboard
    ],
  },
  ethereum: {
    bridgedFromFantom: ["0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3"],
  },
  polygon: {
    bridgedFromFantom: ["0xde12c7959e1a72bbe8a5f7a1dc8f8eef9ab011b3"],
  },
  bsc: {
    bridgedFromFantom: ["0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3"],
  },
  metis: {
    bridgedFromFantom: ["0xDE12c7959E1a72bbe8a5f7A1dc8f8EeF9Ab011B3"],
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

async function chainUnreleased(
  chain: string,
  decimals: number,
  owners: string[]
) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let owner of owners) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: chainContracts[chain].issued[0],
          owner: owner,
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  fantom: {
    minted: chainMinted("fantom", 18),
    unreleased: chainUnreleased("fantom", 18, chainContracts.fantom.reserves),
  },
  ethereum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    fantom: bridgedSupply(
      "ethereum",
      18,
      chainContracts.ethereum.bridgedFromFantom
    ),
  },
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    fantom: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromFantom
    ),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    fantom: bridgedSupply(
      "bsc",
      18,
      chainContracts.bsc.bridgedFromFantom
    ),
  },
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    fantom: bridgedSupply(
      "metis",
      18,
      chainContracts.metis.bridgedFromFantom
    ),
  },
};

export default adapter;

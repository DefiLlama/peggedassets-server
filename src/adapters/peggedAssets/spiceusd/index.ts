const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
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

// There appears to be multichain bridges on each chain that has pools for cross-chain swapping only.
const chainContracts: ChainContracts = {
  avax: {
    issued: ["0xab05b04743e0aeaf9d2ca81e5d3b8385e4bf961e"],
  },
  ethereum: {
    issued: ["0x45fdb1b92a649fb6a64ef1511d3ba5bf60044838"],
    unreleased: ["0xe85131becf5298db58d60e5d628f2c927c7f88cc"],
  },
  polygon: {
    issued: ["0x2f1b1662a895c6ba01a99dcaf56778e7d77e5609"],
  },
  bsc: {
    issued: ["0xde7d1ce109236b12809c45b23d22f30dba0ef424"],
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

async function chainUnreleased(chain: string, decimals: number, owner: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const reserve = (
        await sdk.api.erc20.balanceOf({
          target: issued,
          owner: owner,
          block: _chainBlocks?.[chain],
          chain: chain,
        })
      ).output;
      sumSingleBalance(balances, "peggedUSD", reserve / 10 ** decimals);
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: async () => ({}),
  },
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: chainUnreleased(
      "ethereum",
      18,
      chainContracts.ethereum.unreleased[0]
    ), // seems this is the reserve wallet, the total circulating almost matches their API when this is subtracted
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;

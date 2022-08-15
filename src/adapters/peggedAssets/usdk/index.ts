const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply, solanaMintedOrBridged,
} from "../helper/getSupply";
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
    issued: ["0x1c48f86ae57291f7686349f12601910bd8d470bb"],
  },
  polygon: {
    bridgedFromETH: ["0xD07A7FAc2857901E4bEC0D89bBDAe764723AAB86"],
  },
  okexchain: {
    bridgedFromETH: ["0xdcac52e001f5bd413aa6ea83956438f29098166b"],
  },
  solana: {
    bridgedFromETH: ["43m2ewFV5nDepieFjT9EmAQnc1HRtAF247RBpLGFem5F"], // wormhole
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
  okexchain: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "okexchain",
      18,
      chainContracts.okexchain.bridgedFromETH
    ),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(chainContracts.solana.bridgedFromETH),
  },
};

export default adapter;

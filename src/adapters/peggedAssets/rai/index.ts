const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply, supplyInEthereumBridge } from "../helper/getSupply";
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
    issued: ["0x03ab458634910aad20ef5f1c8ee96f1d6ac54919"],
  },
  polygon: {
    bridgedFromETH: ["0x00e5646f60ac6fb446f621d146b6e1886f002905"],
  },
  optimism: {
    bridgedFromETH: ["0x7fb688ccf682d58f86d7e38e03f9d22e7705448b"],
  },
  arbitrum: {
    bridgedFromETH: ["0xaeF5bbcbFa438519a5ea80B4c7181B4E78d419f2"],
  },
  avax: {
    bridgedFromETH: ["0x97cd1cfe2ed5712660bb6c14053c0ecb031bff7d"],
  },
  xdai: {
    bridgedFromETH: ["0xd7a28Aa9c470e7e9D8c676BCd5dd2f40c5683afa"],
  },
  loopring: {
    bridgeOnETH: ["0x674bdf20A0F284D710BC40872100128e2d66Bd3f"],
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
        "peggedVAR",
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
  polygon: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "polygon",
      18,
      chainContracts.polygon.bridgedFromETH,
      undefined,
      undefined,
      "peggedVAR"
    ),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH,
      undefined,
      undefined,
      "peggedVAR"
    ),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH,
      undefined,
      undefined,
      "peggedVAR"
    ),
  },
  avalanche: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "avax",
      18,
      chainContracts.avax.bridgedFromETH,
      undefined,
      undefined,
      "peggedVAR"
    ),
  },
  xdai: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "xdai",
      18,
      chainContracts.xdai.bridgedFromETH,
      undefined,
      undefined,
      "peggedVAR"
    ),
  },
  loopring: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.loopring.bridgeOnETH[0],
      18,
      "peggedVAR"
    ),
  },
};

export default adapter;

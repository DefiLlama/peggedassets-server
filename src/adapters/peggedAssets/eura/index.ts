const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
  solanaMintedOrBridged,
  supplyInEthereumBridge,
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
    issued: ["0x1a7e4e63778b4f12a199c062f3efdd288afcbce8"],
  },
  polygon: {
    bridgedFromETH: ["0xe0b52e49357fd4daf2c15e02058dce6bc0057db4"],
  },
  optimism: {
    issued: ["0x9485aca5bbBE1667AD97c7fE7C4531a624C8b1ED"],
  },
  arbitrum: {
    issued: ["0xFA5Ed56A203466CbBC2430a43c66b9D8723528E7"],
  },
  solana: {
    bridgedFromETH: ["CbNYA9n3927uXUukee2Hf4tm3xxkffJPPZvGazc2EAH1"], // wormhole
  },
  fuse: {
    bridgedFromETH: ["0xeFAeeE334F0Fd1712f9a8cc375f427D9Cdd40d73"], // multichain
  },
  zksync: {
    bridgeOnETH: ["0xabea9132b05a70803a4e85094fd0e1800777fbef"],
  },
  fantom: {
    bridgedFromETH: ["0x02a2b736F9150d36C0919F3aCEE8BA2A92FBBb40"], // multichain (like USDT and USDC the amount does not match the amount in multichain bridge contract, but the other sources cannot be found; their discord says it might be 'xpollinate or evodefi')
  },
  aurora: {
    bridgedFromETH: ["0xdc7AcDE9ff18B4D189010a21a44cE51ec874eA7C"], // near
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
        "peggedEUR",
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
      "polygon",
      "Ethereum",
      "peggedEUR"
    ),
  },
  optimism: {
    minted: chainMinted("optimism", 18),
    unreleased: async () => ({}),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
    unreleased: async () => ({}),
  },
  solana: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: solanaMintedOrBridged(
      chainContracts.solana.bridgedFromETH,
      "peggedEUR"
    ),
  },
  fuse: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "fuse",
      18,
      chainContracts.fuse.bridgedFromETH,
      "multichain",
      "Ethereum",
      "peggedEUR"
    ),
  },
  zksync: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: supplyInEthereumBridge(
      chainContracts.ethereum.issued[0],
      chainContracts.zksync.bridgeOnETH[0],
      18,
      "peggedEUR"
    ),
  },
  fantom: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "fantom",
      18,
      chainContracts.fantom.bridgedFromETH,
      "multichain",
      "Ethereum",
      "peggedEUR"
    ),
  },
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "aurora",
      18,
      chainContracts.aurora.bridgedFromETH,
      "near",
      "Ethereum",
      "peggedEUR"
    ),
  },
};

export default adapter;

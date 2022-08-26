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
  ethereum: {
    issued: ["0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F"],
  },
  bsc: {
    bridgedFromETH: ["0x23b891e5c62e0955ae2bd185990103928ab817b3"],
  },
  polygon: {
    bridgedFromETH: ["0xb6c473756050de474286bed418b77aeac39b02af"],
  },
  avax: {
    bridgedFromETH: ["0xcfc37a6ab183dd4aed08c204d1c2773c0b1bdf46"],
  },
  arbitrum: {
    bridgedFromETH: ["0x2913e812cf0dcca30fb28e6cac3d2dcff4497688"],
  },
  fantom: {
    bridgedFromETH: ["0xed2a7edd7413021d440b09d654f3b87712abab66"],
  },
  harmony: {
    bridgedFromETH: ["0xed2a7edd7413021d440b09d654f3b87712abab66"],
  },
  boba: {
    bridgedFromETH: ["0x6b4712ae9797c199edd44f897ca09bc57628a1cf"],
  },
  optimism: {
    bridgedFromETH: ["0x67c10c397dd0ba417329543c1a40eb48aaa7cd00"],
  },
  cronos: {
    bridgedFromETH: ["0x396c9c192dd323995346632581bef92a31ac623b"],
  },
  metis: {
    bridgedFromETH: ["0x961318fc85475e125b99cc9215f62679ae5200ab"],
  },
  dfk: {
    bridgedFromETH: ["0x52285d426120ab91f378b3df4a15a036a62200ae"],
  },
  aurora: {
    bridgedFromETH: ["0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c"],
  }
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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("bsc", 18, chainContracts.bsc.bridgedFromETH),
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
  harmony: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "harmony",
      18,
      chainContracts.harmony.bridgedFromETH
    ),
  },
  boba: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("boba", 18, chainContracts.boba.bridgedFromETH),
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
  /* call is reverting on server every time, temporarily disabling
  cronos: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("cronos", 18, chainContracts.cronos.bridgedFromETH),
  },
  */
  metis: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("metis", 18, chainContracts.metis.bridgedFromETH),
  },
  /* Supply is 0.
  dfk: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("dfk", 18, chainContracts.dfk.bridgedFromETH),
  },
  */
  aurora: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("aurora", 18, chainContracts.aurora.bridgedFromETH),
  },
};

export default adapter;

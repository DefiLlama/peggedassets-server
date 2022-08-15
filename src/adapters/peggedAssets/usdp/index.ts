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
    issued: ["0x1456688345527be1f37e9e627da0837d6f08c925"],
  },
  xdai: {
    bridgedFromETH: ["0xFe7ed09C4956f7cdb54eC4ffCB9818Db2D7025b8"],
  },
  bsc: {
    issued: ["0xDACD011A71f8c9619642bf482f1D4CeB338cfFCf"],
  },
  fantom: {
    issued: ["0x3129aC70c738D398d1D74c87EAB9483FD56D16f8"],
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

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  xdai: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("xdai", 18, chainContracts.xdai.bridgedFromETH),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: async () => ({}),
  },
  fantom: {
    minted: chainMinted("fantom", 18),
    unreleased: async () => ({}),
  },
};

export default adapter;

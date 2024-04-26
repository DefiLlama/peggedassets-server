const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x0E573Ce2736Dd9637A0b21058352e1667925C7a8"],
  },
  bsc: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  optimism: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  arbitrum: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  avax: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  polygon: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
  },
  tomochain: {
    bridgedFromETH: ["0x323665443CEf804A3b5206103304BD4872EA4253"],
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
    minted: chainMinted("ethereum", 6),
  },
  bsc: {
    minted: bridgedSupply("bsc", 6, chainContracts.bsc.bridgedFromETH),
  },
  optimism: {
    minted: bridgedSupply(
      "optimism",
      6,
      chainContracts.optimism.bridgedFromETH
    ),
  },
  arbitrum: {
    minted: bridgedSupply(
      "arbitrum",
      6,
      chainContracts.arbitrum.bridgedFromETH
    ),
  },
  polygon: {
    minted: bridgedSupply("polygon", 6, chainContracts.polygon.bridgedFromETH),
  },
  tomochain: {
    minted: bridgedSupply(
      "tomochain",
      6,
      chainContracts.tomochain.bridgedFromETH
    ),
  },
  avax: {
    minted: bridgedSupply("avax", 6, chainContracts.avax.bridgedFromETH),
  },
};

export default adapter;

const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
  ChainContracts,
} from "../peggedAsset.type";


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x78da5799CF427Fee11e9996982F4150eCe7a99A7"],
  },
  base: {
    bridgedFromETH: ["0x8E5E9DF4F0EA39aE5270e79bbABFCc34203A3470"],
  },
  arbitrum: {
    bridgedFromETH: ["0x96a993f06951b01430523d0d5590192d650ebf3e"],
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
  base: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("base", 18, chainContracts.base.bridgedFromETH),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("arbitrum", 18, chainContracts.arbitrum.bridgedFromETH),
  },
};

export default adapter;

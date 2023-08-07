const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const axios = require("axios")
const retry = require("async-retry");


type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xc56c2b7e71b54d38aab6d52e94a04cbfa8f604fa"],
  },
  optimism: {
    bridgedFromETH: ["0x6e4cc0ab2b4d2edafa6723cfa1582229f1dd1be1"] ,
  },
  arbitrum: {
    bridgedFromETH: ["0x6e4cc0ab2b4d2edafa6723cfa1582229f1dd1be1"],
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

async function gmoAPIChainMinted(chain: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const issuance = await retry(
      async (_bail: any) =>
        await axios.get("https://stablecoin.z.com/token/totalSupply")
    );
    console.info("GMO API success");
    const gyenData = issuance.data.data.filter(
      (obj: any) => obj.symbol === "ZUSD"
    );
    const filteredChainsData = await gyenData[0].chains.filter(
      (obj: any) => obj.chain === chain
    );
    const supply = parseInt(filteredChainsData[0].amount);
    sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    return balances;
  };
}



const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 6),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: chainMinted("optimism", 6),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
        "optimism",
        6,
       chainContracts.optimism.bridgedFromETH,
     ),
 },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
        "arbitrum",
        6,
        chainContracts.arbitrum.bridgedFromETH,
    ),
 },
 stellar: {
   minted: gmoAPIChainMinted("XLM"),
   unreleased: async () => ({}),
 }
};

export default adapter;

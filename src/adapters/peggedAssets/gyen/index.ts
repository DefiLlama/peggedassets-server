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
    issued: ["0xC08512927D12348F6620a698105e1BAac6EcD911"] ,
  },
  optimism: {
    bridgedFromETH: ["0x589d35656641d6aB57A545F08cf473eCD9B6D5F7"] ,
  },
  arbitrum: {
    bridgedFromETH: ["0x589d35656641d6aB57A545F08cf473eCD9B6D5F7"],
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
      console.log(issued);
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
        "peggedJPY",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
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
        (obj: any) => obj.symbol === "GYEN"
      );
      const filteredChainsData = await gyenData[0].chains.filter(
        (obj: any) => obj.chain === chain
      );
      const supply = parseInt(filteredChainsData[0].amount);
      sumSingleBalance(balances, "peggedJPY", supply, "issued", false);
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
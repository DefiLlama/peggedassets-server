const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { cosmosSupply } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
const axios = require("axios");
const retry = require("async-retry");


const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x39b8B6385416f4cA36a20319F70D28621895279D"],
  },
  polygon: {
    issued: ["0xE0aEa583266584DafBB3f9C3211d5588c73fEa8d"],
  },
  xdai: {
    issued: ["0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430"],
  },
  arbitrum: {
    issued: ["0x0c06cCF38114ddfc35e07427B9424adcca9F44F8"],
  },
  linea: {
    issued: ["0x3ff47c5Bf409C86533FE1f4907524d304062428D"],
  },
  scroll: {
    issued: ["0xd7BB130A48595fCDf9480E36C1aE97ff2938aC21"],
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

async function algorandMinted() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supplyRes = await retry(
      async (_bail: any) =>
        await axios.get("https://mainnet-idx.algonode.cloud/v2/assets/83209012")
    );
    const supply = supplyRes.data.asset.params.total;
    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://mainnet-idx.algonode.cloud/v2/accounts/XSAED32VYAQK42TQHKCRHYK7P6LBBPQ2237PALQZAGL2XJTNNOPD523CNA"
        )
    );
    const reserveAccount = reserveRes.data.account.assets.filter(
      (asset: any) => asset["asset-id"] === 83209012
    );
    const reserves = reserveAccount[0].amount;
    const balance = (supply - reserves) / 10 ** 8;
    sumSingleBalance(balances, "peggedEUR", balance, "issued", false);
    return balances;
  };
}


function nobleSupply() {
  return cosmosSupply("noble", ['ueure'], 6, '', 'peggedEUR');
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
  },
  xdai: {
    minted: chainMinted("xdai", 18),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
  },
  arbitrum: {
    minted: chainMinted("arbitrum", 18),
  },
  linea: {
    minted: chainMinted("linea", 18),
  },
  scroll: {
    minted: chainMinted("scroll", 18),
  },
  algorand: {
    minted: algorandMinted(),
  },
  noble: {
    minted: nobleSupply(),
  },
};

export default adapter;

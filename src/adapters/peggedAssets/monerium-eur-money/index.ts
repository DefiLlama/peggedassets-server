const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { algorandGetBalance, algorandGetTotalSupply, cosmosSupply } from "../helper/getSupply";
import {
  Balances,
  ChainBlocks,
  ChainContracts,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";


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
  base: {
    issued: ["0xbf6e2966A9C3D99C9E4D069E04f7Bdb9C8aa762C"],
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
    // ASA total minus the reserve account's holding
    const assetId = 83209012;
    const supply = await algorandGetTotalSupply(assetId);
    const reserves = await algorandGetBalance(assetId, "XSAED32VYAQK42TQHKCRHYK7P6LBBPQ2237PALQZAGL2XJTNNOPD523CNA");
    sumSingleBalance(balances, "peggedEUR", supply - reserves, "issued", false);
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
  base: {
    minted: chainMinted("base",18),
  },
  algorand: {
    minted: algorandMinted(),
  },
  noble: {
    minted: nobleSupply(),
  },
};

export default adapter;

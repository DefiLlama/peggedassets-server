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
    issued: ["0x3231Cb76718CDeF2155FC47b5286d82e6eDA273f"],
  },
  polygon: {
    issued: ["0x18ec0A6E18E5bc3784fDd3a3634b31245ab704F6"],
  },
  xdai: {
    issued: ["0xcB444e90D8198415266c6a2724b7900fb12FC56E"],
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
  algorand: {
    minted: algorandMinted(),
  },
  noble: {
    minted: nobleSupply(),
  },
};

export default adapter;

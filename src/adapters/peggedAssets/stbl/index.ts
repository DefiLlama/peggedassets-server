const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";
const { lookupApplications } = require("../llama-helper/algorand");
const axios = require("axios");
const retry = require("async-retry");

type price = {
  [asset: string]: number;
};

const marketStrings = {
  underlying_cash: "uc",
  underlying_borrowed: "ub",
  underlying_reserves: "ur",
  active_collateral: "acc",
  oracle_price_scale_factor: "ops",
  lp_circulation: "lc",
};

const orderedAssets = ["STBL"];

const assetDictionary = {
  STBL: {
    decimals: 6,
    marketAppId: 465814278,
    oracleAppId: 451327550,
    oracleFieldName: "price",
  },
};

async function getGlobalMarketState(marketId: number) {
  let response = await lookupApplications(marketId);
  let results = {} as any;
  response.application.params["global-state"].forEach((x: any) => {
    let decodedKey = Buffer.from(x.key, "base64").toString("binary");
    results[decodedKey] = x.value.uint;
  });

  return results;
}

function getMarketSupply(
  assetName: string,
  marketGlobalState: any,
  prices: price,
  assetDictionary: any
) {
  let underlyingCash =
    assetName === "STBL" || assetName === "vALGO"
      ? marketGlobalState[marketStrings.active_collateral]
      : marketGlobalState[marketStrings.underlying_cash];
  let supplyUnderlying =
    underlyingCash - marketGlobalState[marketStrings.underlying_reserves];
  supplyUnderlying /= Math.pow(10, assetDictionary[assetName]["decimals"]);

  return supplyUnderlying * prices[assetName];
}

async function supply() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;

    const supplyRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://algoindexer.algoexplorerapi.io/v2/assets/465865291"
        )
    );
    const supply = supplyRes.data.asset.params.total;
    const reserveRes = await retry(
      async (_bail: any) =>
        await axios.get(
          "https://algoindexer.algoexplorerapi.io/v2/accounts/OPY7XNB5LVMECF3PHJGQV2U33LZPM5FBUXA3JJPHANAG5B7GEYUPZJVYRE"
        )
    );
    const reserveAccount = reserveRes.data.account.assets.filter(
      (asset: any) => asset["asset-id"] === 465865291
    );
    const reserves = reserveAccount[0].amount;

    let prices = { STBL: 1 };
    let collateralSTBL = 0;
    for (const assetName of orderedAssets) {
      const marketAppId = assetDictionary["STBL"]["marketAppId"] as number;
      let marketGlobalState = await getGlobalMarketState(marketAppId);
      let assetTvl = getMarketSupply(
        assetName,
        marketGlobalState,
        prices,
        assetDictionary
      );
      collateralSTBL += assetTvl;
    }

    const balance = collateralSTBL + (supply - reserves) / 10 ** 6;

    sumSingleBalance(
      balances,
      "peggedUSD",
      balance,
      "issued",
      false
    );
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  algorand: {
    minted: supply(),
    unreleased: async () => ({}),
  },
};

export default adapter;

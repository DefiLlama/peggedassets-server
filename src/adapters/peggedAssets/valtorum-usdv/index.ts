const axios = require("axios");
const retry = require("async-retry");

import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const NODE_URL = "https://xrplcluster.com";
const STELLAR_HORIZON = "https://horizon.stellar.org";

const USDV_ISSUER = "rfffsukWALJB1PXYk7H8xkR6UJUDT8nMJE";
const USDV_CURRENCY = "5553445600000000000000000000000000000000";
const STELLAR_USDV_ISSUER = "GBLAJOKBIIT7P32BJQFCSRJVOE2SXHI4D5ZGLFJ4DLMFJXI2NN6R37G5";

async function minted() {
  const balances = {} as Balances;
  const payload = {
    method: "gateway_balances",
    params: [
      {
        account: USDV_ISSUER,
        ledger_index: "validated",
      },
    ],
  };

  const res = await retry(async (_bail: any) => axios.post(NODE_URL, payload));
  const supply = parseFloat(res.data.result.obligations[USDV_CURRENCY] ?? "0");

  sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
  return balances;
}
async function stellarMinted() {
  const balances = {} as Balances;

  const res = await retry(async (_bail: any) =>
    axios.get(
      `${STELLAR_HORIZON}/assets?asset_code=USDV&asset_issuer=${STELLAR_USDV_ISSUER}`
    )
  );

const record = res.data._embedded?.records?.[0];
const supply = parseFloat(record?.balances?.authorized ?? "0")
  + parseFloat(record?.balances?.authorized_to_maintain_liabilities ?? "0")
  + parseFloat(record?.claimable_balances_amount ?? "0")
  + parseFloat(record?.liquidity_pools_amount ?? "0")
  + parseFloat(record?.contracts_amount ?? "0");
  sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
  return balances;
}
const adapter: PeggedIssuanceAdapter = {
  ripple: {
    minted,
    unreleased: async () => ({}),
  },
  stellar: {
    minted: stellarMinted,
    unreleased: async () => ({}),
  },
};

export default adapter;

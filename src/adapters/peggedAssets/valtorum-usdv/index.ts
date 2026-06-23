const axios = require("axios");
const retry = require("async-retry");

import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const NODE_URL = "https://xrplcluster.com";

const USDV_ISSUER = "rfffsukWALJB1PXYk7H8xkR6UJUDT8nMJE";
const USDV_CURRENCY = "5553445600000000000000000000000000000000";

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

const adapter: PeggedIssuanceAdapter = {
  ripple: {
    minted,
    unreleased: async () => ({}),
  },
};

export default adapter;

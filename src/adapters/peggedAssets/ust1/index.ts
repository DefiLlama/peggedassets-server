const axios = require("axios");
const retry = require("async-retry");
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

/**
 * UST1 unstablecoin on Terra Classic.
 * Circulating = CW20 token_info.total_supply / 1e6 (human). peggedUSD.
 * Mechanism: crypto-backed (ust1-window vs vFDUSD). Do not hardcode $1.
 */

const UST1 = "terra1f0eqgy9w7e5e7up97vjudqwx38tesf8ylx75x2lv3nwm0clry0pqmgfy72";
const UST1_DECIMALS = 6;
const TERRA_LCD = "https://terra-classic-lcd.publicnode.com";

async function terraMinted() {
  const query = Buffer.from(JSON.stringify({ token_info: {} })).toString("base64");
  const url = `${TERRA_LCD}/cosmwasm/wasm/v1/contract/${UST1}/smart/${query}`;
  const res = await retry(async (_bail: any) => await axios.get(url));
  const raw = res?.data?.data?.total_supply;
  const n = Number(raw);
  if (raw == null || raw === "" || !Number.isFinite(n) || n < 0) {
    throw new Error("UST1 token_info.total_supply missing or invalid");
  }
  const balances = {} as Balances;
  sumSingleBalance(balances, "peggedUSD", n / 10 ** UST1_DECIMALS, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  terra: {
    minted: terraMinted,
    unreleased: async () => ({}),
  },
};

export default adapter;

import { chains } from "@defillama/sdk";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

/**
 * UST1 unstablecoin on Terra Classic.
 * Circulating = CW20 token_info.total_supply / 1e6 (human). peggedUSD.
 * Mechanism: crypto-backed (ust1-window vs vFDUSD). Do not hardcode $1.
 */

const UST1 = "terra1f0eqgy9w7e5e7up97vjudqwx38tesf8ylx75x2lv3nwm0clry0pqmgfy72";
const UST1_DECIMALS = 6;

async function terraMinted() {
  // cw20 token_info smart query on the Terra Classic LCD (`TERRA_LCD` env overrides)
  const info = await chains.cosmos.queryContract({ chain: "terra", contract: UST1, data: { token_info: {} } });
  const raw = info?.total_supply;
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

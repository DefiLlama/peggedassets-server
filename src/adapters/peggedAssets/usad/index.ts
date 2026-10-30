import axios from "axios";
import { sumSingleBalance } from "../helper/generalUtil";
import type { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

async function minted(): Promise<Balances> {
  // token_info[true].supply includes both public and private USAD, and is
  // updated by every mint/burn. AMM wrappers must not be counted again.
  const { data } = await axios.get<string>(
    "https://api.provable.com/v1/mainnet/program/usad_stablecoin.aleo/mapping/token_info/true",
    { timeout: 30000 }
  );
  const supply = typeof data === "string" && data.match(/\bsupply:\s*(\d+)u128\b/);
  if (!supply || !/\bdecimals:\s*6u8\b/.test(data)) {
    throw new Error("Unable to read Aleo USAD supply from token_info");
  }
  const balances = {} as Balances;
  sumSingleBalance(balances, "peggedUSD", Number(supply[1]) / 1e6, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  aleo: {
    minted,
    unreleased: async () => ({}),
  },
};

export default adapter;

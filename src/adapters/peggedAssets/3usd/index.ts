const fetch = require("axios");
import { sumSingleBalance } from "../helper/generalUtil";
import { PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";

async function karuraMinted() {
  const result = await fetch(
    "https://api.taigaprotocol.io/tokens/3usd/stats"
  );
  const balances: Balances = {};
  sumSingleBalance(balances, 'peggedUSD', Number(result.data.chains.karura));

  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  karura: {
    minted: karuraMinted,
    unreleased: async () => ({}),
  },
};

export default adapter;

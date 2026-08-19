const axios = require("axios");
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const assetId =
  "86143388bd056a8f0bab669f78f14873fac8e2dd8d57898cdb725a2d5e2e4f8f";

async function zanoMinted(): Promise<Balances> {
  const balances = {} as Balances;
  const res = await axios.get(
    `https://explorer.zano.org/api/get_asset_details/${assetId}`
  );
  const asset = res.data?.asset;
  console.log('asset', asset)
  if (!asset) {
    throw new Error(`Zano API returned no asset details for ${assetId}`);
  }
  const supply = Number(asset.current_supply) / 10 ** Number(asset.decimal_point);
  sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  zano: {
    minted: zanoMinted,
  },
};

export default adapter;

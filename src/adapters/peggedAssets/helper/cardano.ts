const axios = require("axios");
const retry = require("async-retry");
const endpoint = "https://cardano-mainnet.blockfrost.io/api";

const config = {
  headers: {
    "project_id": "mainnet8Ecrf3SQfuuL7XXyotNDGAZoUTcnWQDP"
  }
}

export async function getAsset(assetID: string) { // assetID is concatenation of the policy_id and hex-encoded asset_name
  const asset = await retry(
    async (_bail: any) =>
      await axios.get(`${endpoint}/v0/assets/${assetID}`, config)
  );
  const data = asset.data;
  return data;
}

export async function getTotalSupply(assetID: string) {
  const asset = await getAsset(assetID);
  const decimals = asset?.metadata?.decimals;
  const supply = asset?.quantity;
  return supply / 10 ** decimals;
}


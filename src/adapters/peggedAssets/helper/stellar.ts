const axios = require("axios");
const retry = require("async-retry");

const stellarExpertEndpoint = (assetID: string): string =>
  `https://api.stellar.expert/explorer/public/asset/${assetID.replace(":", "-")}`;

export async function getAsset(assetID: string) {
  // assetID is concatenation of the assetCode and assetIssuer, separated by a colon
  const asset = await retry(
    async (_bail: any) =>
      await axios.get(stellarExpertEndpoint(assetID))
  );
  const data = asset.data;
  return data;
}

export async function getTotalSupply(assetID: string) {
  // assetID is concatenation of the assetCode and assetIssuer, separated by a colon
  const asset = await getAsset(assetID);
  const decimals = 7;
  const supply = asset?.supply;
  return supply / 10 ** decimals;
}

const axios = require("axios");
const retry = require("async-retry");

const stellarExpertEndpoint = (assetCode: string, assetIssuer: string): string =>
  `https://api.stellar.expert/explorer/public/asset/${assetCode}-${assetIssuer}`;

export async function getAsset(assetID: string) {
  // assetID is concatenation of the assetCode and assetIssuer, separated by a colon
  const [assetCode, assetIssuer] = assetID.split(":");
  const asset = await retry(
    async (_bail: any) =>
      await axios.get(stellarExpertEndpoint(assetCode, assetIssuer))
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

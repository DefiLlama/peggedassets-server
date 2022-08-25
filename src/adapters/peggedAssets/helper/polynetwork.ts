const axios = require("axios");
const retry = require("async-retry");

export async function getTotalBridged(chainID: number, chainName: string, assetName: string) {
  const res = await retry(
    async (_bail: any) =>
      await axios.get(
        `https://explorer.poly.network/api/v1/gettransferstatistic?chain=${chainID}`
      )
  );
  const chainInfo = res?.data?.chain_transfer_statistics?.filter(
    (obj: any) => obj.chainname === chainName
  );
  const assetInfo = chainInfo?.[0]?.asset_transfer_statistics?.filter(
    (obj: any) => obj.name === assetName
  );
  return parseInt(assetInfo?.[0]?.amount);
}

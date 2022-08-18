const axios = require("axios");
const retry = require("async-retry");
const BigNumber = require("bignumber.js");

export async function getTotalSupply(contract: string, decimals?: number) {
  const res = await retry(
    async (_bail: any) =>
      await axios.get(`https://api.tzkt.io/v1/tokens?contract=${contract}`)
  );

  const supply = new BigNumber(res?.data?.[0]?.totalSupply);
  const metadataDecimals = new BigNumber(res?.data?.[0]?.metadata?.decimals);

  const d = decimals ? decimals : metadataDecimals;

  return supply.div(10 ** d).toNumber();
}

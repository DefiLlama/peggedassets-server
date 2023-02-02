const axios = require("axios");
const retry = require("async-retry");

export async function getTotalSupply(address: string) {
  const res = await retry(
    async (_bail: any) =>
      await axios.get(
        `https://explorer.kava.io/api?module=token&action=getToken&contractaddress=${address}`
      )
  );
  const result = res?.data?.result;
  const supply = result.totalSupply;
  const decimals = result.decimals;
  return supply / 10 ** decimals;
}

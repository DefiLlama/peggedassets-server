const axios = require("axios");
const retry = require("async-retry");
const endpoint = "https://fullnode.mainnet.aptoslabs.com";

export async function aQuery(api: string) {
  const query = await retry(
    async (_bail: any) => await axios.get(`${endpoint}${api}`)
  );
  return query;
}

export async function getResources(account: string, type?: string) {
  const resources = await retry(
    async (_bail: any) =>
      await axios.get(`${endpoint}/v1/accounts/${account}/resources`)
  );
  const data = resources.data;
  if (type) {
    return data.filter((obj: any) => obj.type === type)[0];
  }
  return data;
}

export async function getTotalSupply(account: string, type?: string) {
  const resources = await getResources(account, type);
  const decimals = resources?.data?.decimals;
  const supply = resources?.data?.supply?.vec?.[0].integer?.vec?.[0].value;
  return supply / 10 ** decimals;
}

export async function getTokenSupply(token: string) {
  const { data } = await axios.get(`${endpoint}/v1/accounts/${token}/resources`);
  const coinInfo = data.find((coin: any) => coin.type.startsWith('0x1::coin::CoinInfo'));
  console.log(JSON.stringify(data ), coinInfo)

  return coinInfo.data.supply.vec[0].integer.vec[0].value / 10 ** coinInfo.data.decimals;
}
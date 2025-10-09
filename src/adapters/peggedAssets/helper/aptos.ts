const axios = require("axios");
const retry = require("async-retry");
const endpoint = process.env.APTOS_RPC ?? "https://fullnode.mainnet.aptoslabs.com";
import http from "../helper/http";

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

  if (token === '0x50038be55be5b964cfa32cf128b5cf05f123959f286b4cc02b86cafd48945f89') {
    const coinInfo = data.find((coin: any) => coin.type === '0x4de5876d8a8e2be7af6af9f3ca94d9e4fafb24b5f4a5848078d8eb08f08e808a::ds_token::TokenData')
    return coinInfo.data.total_issued / 1e6
  }

  // Handle Franklin Onchain U.S. Government Money Fund token
  if (token === '0x7b5e9cac3433e9202f28527f707c89e1e47b19de2c33e4db9521a63ad219b739') {
    const concurrentSupply = data.find((coin: any) => coin.type === '0x1::fungible_asset::ConcurrentSupply');
    const metadata = data.find((coin: any) => coin.type === '0x1::fungible_asset::Metadata');
    if (concurrentSupply && metadata) {
      const supply = concurrentSupply.data.current.value;
      const decimals = metadata.data.decimals;
      return parseInt(supply) / 10 ** decimals;
    }
  }

  // Handle USD1-WLFI fungible asset
  if (token === '0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2') {
    const concurrentSupply = data.find((coin: any) => coin.type === '0x1::fungible_asset::ConcurrentSupply');
    const metadata = data.find((coin: any) => coin.type === '0x1::fungible_asset::Metadata');
    if (concurrentSupply && metadata) {
      const supply = concurrentSupply.data.current.value;
      const decimals = metadata.data.decimals;
      return parseInt(supply) / 10 ** decimals;
    }
  }

  const coinInfo = data.find((coin: any) => coin.type.startsWith('0x1::coin::CoinInfo'));

  return coinInfo.data.supply.vec[0].integer.vec[0].value / 10 ** coinInfo.data.decimals;
}

const MOVEMENT_RPC = "https://mainnet.movementnetwork.xyz";

export async function function_view({
  functionStr,
  type_arguments = [],
  args = [],
  ledgerVersion,
}: {
  functionStr: string;
  type_arguments?: string[];
  args?: any[];
  ledgerVersion?: number;
}) {
  let path = `${MOVEMENT_RPC}/v1/view`;
  if (ledgerVersion !== undefined) path += `?ledger_version=${ledgerVersion}`;
  const response = await http.post(path, {
    function: functionStr,
    type_arguments,
    arguments: args,
  });
  return response.length === 1 ? response[0] : response;
}
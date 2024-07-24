import http from "../helper/http";
const axios = require("axios");

interface CallOptions {
  withMetadata?: boolean;
}

export const endpoint = (): string => "https://fullnode.mainnet.sui.io/";

export async function getObject(objectId: string): Promise<any> {
  return (
    await call("sui_getObject", [
      objectId,
      {
        showType: true,
        showOwner: true,
        showContent: true,
      },
    ])
  ).content;
}

export async function call(
  method: string,
  params: any,
  { withMetadata = false }: CallOptions = {}
): Promise<any> {
  if (!Array.isArray(params)) params = [params];
  const { result } = await http.post(endpoint(), {
    jsonrpc: "2.0",
    id: 1,
    method,
    params,
  });
  return withMetadata ? result : result.data;
}


export async function getTokenSupply(token: string) {
  const { data: { result: { decimals } } } = await axios.post(endpoint(), {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "suix_getCoinMetadata",
    "params": [token]
  });
  const { data: { result: { value: supply } } } = await axios.post(endpoint(), {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "suix_getTotalSupply",
    "params": [token]
  });
  return supply / 10 ** decimals;
}
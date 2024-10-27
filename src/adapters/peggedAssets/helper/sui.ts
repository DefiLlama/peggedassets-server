import { graph } from "@defillama/sdk";
import http from "../helper/http";

interface CallOptions {
  withMetadata?: boolean;
}

export const endpoint = (): string => "https://fullnode.mainnet.sui.io/";
export const graphEndpoint = (): string => "https://sui-mainnet.mystenlabs.com/graphql";

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
  const query = `{
  coinMetadata(coinType:"${token}") {
    decimals
    symbol
    supply
  }
}`
  const { coinMetadata: { supply, decimals } } = await graph.request(graphEndpoint(), query)
  return supply / 10 ** decimals
}
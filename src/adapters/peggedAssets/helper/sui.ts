import { graph } from "@defillama/sdk";  // Keeping the import in case other functions rely on it
import http from "../helper/http";

interface CallOptions {
  withMetadata?: boolean;
}

// Define the Sui API endpoint and the GraphQL endpoint
export const endpoint = (): string => "https://fullnode.mainnet.sui.io/";
export const graphEndpoint = (): string => "https://sui-mainnet.mystenlabs.com/graphql";

// Function to fetch object details from Sui
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

// Generic function to make JSON-RPC calls
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

// Function to get the token supply from the GraphQL API
export async function getTokenSupply(token: string) {
  const query = {
    query: `{
      coinMetadata(coinType:"${token}") {
        decimals
        symbol
        supply
      }
    }`
  };

  // Use http.post to send the query to the GraphQL endpoint
  const response = await http.post(graphEndpoint(), query);

  // Check if response contains the necessary data
  const { data } = response;
  if (!data || !data.coinMetadata) {
    throw new Error("Error fetching token supply: coinMetadata not found");
  }

  const { supply, decimals } = data.coinMetadata;
  return supply / 10 ** decimals;
}

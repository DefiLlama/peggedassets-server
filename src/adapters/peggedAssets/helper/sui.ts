import { graph } from "@defillama/sdk";
import http from "../helper/http";

interface CallOptions {
  withMetadata?: boolean;
}

export const endpoint = (): string => "https://fullnode.mainnet.sui.io/";
export const graphEndpoint = (): string => "https://graphql.mainnet.sui.io/graphql";

export async function getObject(objectId: string): Promise<any> {
  const query = `{
  object(address:"${objectId}") {
    asMoveObject {
      contents {
        type { repr }
        json
      }
    }
  }
}`;
  const { object } = await graph.request(graphEndpoint(), query);
  const contents = object?.asMoveObject?.contents;
  if (!contents) return undefined;
  return { type: contents.type?.repr, fields: contents.json };
}

// JSON-RPC on public Sui fullnodes has been decommissioned (-32601 "Method not found"),
// so dynamic fields have to be read through GraphQL. `name.bcs` is the BCS encoding of the
// key value: a Move struct whose only member is `dummy_field: bool` encodes to a single
// zero byte, which is the shape Wormhole-style `Key<T>` witness structs use.
export const EMPTY_STRUCT_BCS = "AA==";

export async function getDynamicFieldObject(
  parentId: string,
  nameType: string,
  nameBcs: string = EMPTY_STRUCT_BCS
): Promise<any> {
  const name = `{type:${JSON.stringify(nameType)}, bcs:${JSON.stringify(nameBcs)}}`;
  const query = `{
  address(address:${JSON.stringify(parentId)}) {
    dynamicField(name:${name}) {
      value { ... on MoveValue { type { repr } json } }
    }
    dynamicObjectField(name:${name}) {
      value { ... on MoveObject { contents { type { repr } json } } }
    }
  }
}`;
  const { address } = await graph.request(graphEndpoint(), query);
  // Wrapped objects live under dynamicObjectField; plain Move values under dynamicField.
  const value =
    address?.dynamicObjectField?.value?.contents ?? address?.dynamicField?.value;
  if (!value) return undefined;
  return { type: value.type?.repr, fields: value.json };
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
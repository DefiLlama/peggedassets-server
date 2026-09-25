import { chains } from "@defillama/sdk";

const { sui } = chains;

// `SUI_GRAPH_RPC` env overrides the GraphQL endpoint. Objects are returned as the raw GraphQL
// `{ type, fields: json }` (no JSON-RPC style nested `fields` wrappers) because adapters index
// straight into the json, so the two object readers keep their own queries on the sdk transport.

export async function getObject(objectId: string): Promise<any> {
  const data = await sui.graphqlCall({
    query: `query ($address: SuiAddress!) {
    object(address: $address) { asMoveObject { contents { type { repr } json } } }
  }`,
    variables: { address: objectId },
  });
  const contents = data.object?.asMoveObject?.contents;
  if (!contents) return undefined;
  return { type: contents.type?.repr, fields: contents.json };
}

// `name.bcs` is the BCS encoding of the key value: a Move struct whose only member is `dummy_field: bool`
// encodes to a single zero byte, which is the shape Wormhole-style `Key<T>` witness structs use.
export const EMPTY_STRUCT_BCS = sui.EMPTY_STRUCT_BCS;

export async function getDynamicFieldObject(
  parentId: string,
  nameType: string,
  nameBcs: string = EMPTY_STRUCT_BCS
): Promise<any> {
  const data = await sui.graphqlCall({
    query: `query ($parent: SuiAddress!, $name: DynamicFieldName!) {
    address(address: $parent) {
      dynamicField(name: $name) { value { ... on MoveValue { type { repr } json } } }
      dynamicObjectField(name: $name) { value { ... on MoveObject { contents { type { repr } json } } } }
    }
  }`,
    variables: { parent: parentId, name: { type: nameType, bcs: nameBcs } },
  });
  // Wrapped objects live under dynamicObjectField; plain Move values under dynamicField.
  const address = data.address;
  const value = address?.dynamicObjectField?.value?.contents ?? address?.dynamicField?.value;
  if (!value) return undefined;
  return { type: value.type?.repr, fields: value.json };
}

// supply / 10 ** decimals from coinMetadata
export async function getTokenSupply(token: string): Promise<number> {
  const { normalized } = await sui.getTokenSupply({ coinType: token });
  return normalized;
}

// Wormhole keeps a wrapped coin's TreasuryCap inside the token bridge's WrappedAsset, so coinMetadata
// (and the decommissioned suix_getTotalSupply) don't expose its supply. The WrappedAsset is a dynamic
// field on the token registry, which is the `token_registry` field of the bridge state object
// 0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9.
const SUI_WORMHOLE_TOKEN_BRIDGE = "0x26efee2b51c911237888e5dc6702868abca3c7ac12c53f76ef8eba0697695e3d";
const SUI_WORMHOLE_TOKEN_REGISTRY = "0x334881831bd89287554a6121087e498fa023ce52c037001b53a4563a00a281a5";

// total supply (whole units) of a Wormhole wrapped coin, `coinAddress` being the package of `<addr>::coin::COIN`
export async function getWormholeWrappedSupply(coinAddress: string): Promise<number> {
  const wrappedAsset = await getDynamicFieldObject(
    SUI_WORMHOLE_TOKEN_REGISTRY,
    `${SUI_WORMHOLE_TOKEN_BRIDGE}::token_registry::Key<${coinAddress}::coin::COIN>`
  );
  // GraphQL returns the Move value as plain nested JSON, without JSON-RPC's `fields` wrappers.
  const wrapped = wrappedAsset?.fields?.value ?? wrappedAsset?.fields;
  if (!wrapped) throw new Error(`sui: wormhole WrappedAsset not found for ${coinAddress}`);
  return Number(wrapped.treasury_cap.total_supply.value) / 10 ** Number(wrapped.decimals);
}

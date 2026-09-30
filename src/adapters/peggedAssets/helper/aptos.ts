import { chains } from "@defillama/sdk";

const { aptos } = chains;

const COIN_INFO_PREFIX = "0x1::coin::CoinInfo<";
const FA_METADATA_TYPE = "0x1::fungible_asset::Metadata";

// `APTOS_RPC` / `MOVE_RPC` env override the endpoints. All resources of `account`, or the single
// `{ type, data }` resource of `type` (undefined when the account does not hold it).
export async function getResources(account: string, type?: string): Promise<any> {
  if (!type) return aptos.getResources({ account });
  const data = await aptos.getResource({ account, type });
  return data ? { type, data } : undefined;
}

// supply of a `0x1::coin::CoinInfo<T>` resource held by `account`, in whole units
export async function getTotalSupply(account: string, type?: string) {
  const resource = await getResources(account, type);
  const decimals = resource?.data?.decimals;
  const supply = resource?.data?.supply?.vec?.[0]?.integer?.vec?.[0]?.value;
  return supply / 10 ** decimals;
}

// `token` is either a coin type (`addr::module::Name`), a coin module account holding the
// `CoinInfo<T>` resource, or a fungible asset metadata object address. Returns whole units.
export async function getTokenSupply(token: string): Promise<number> {
  if (aptos.isFungibleAssetAddress(token)) {
    const resources: any[] = await aptos.getResources({ account: token });
    const coinInfo = resources.find((r) => typeof r.type === "string" && r.type.startsWith(COIN_INFO_PREFIX));
    if (coinInfo)
      return Number(coinInfo.data.supply.vec[0].integer.vec[0].value) / 10 ** Number(coinInfo.data.decimals);
    const metadata = resources.find((r) => r.type === FA_METADATA_TYPE);
    if (!metadata) throw new Error(`aptos: no CoinInfo or fungible asset Metadata resource at ${token}`);
    // fungible asset: supply view, falling back to the ConcurrentSupply / Supply resources
    const supply = await aptos.getCoinSupply({ coinType: token });
    return Number(supply) / 10 ** Number(metadata.data.decimals);
  }
  const [supply, info] = await Promise.all([
    aptos.getCoinSupply({ coinType: token }),
    aptos.getCoinInfo({ coinType: token }),
  ]);
  return Number(supply) / 10 ** info.decimals;
}

// `#[view]` function call; defaults to the Movement network (`chain: 'move'`), pass `chain: 'aptos'` for Aptos.
// A single return value is unwrapped, otherwise the result array is returned.
export async function function_view({
  functionStr,
  type_arguments = [],
  args = [],
  ledgerVersion,
  chain = "move",
}: {
  functionStr: string;
  type_arguments?: string[];
  args?: any[];
  ledgerVersion?: number;
  chain?: string;
}) {
  const response = await aptos.view({ chain, function: functionStr, typeArguments: type_arguments, args, ledgerVersion });
  return response.length === 1 ? response[0] : response;
}

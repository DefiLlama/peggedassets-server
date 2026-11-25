import * as sdk from "@defillama/sdk";
import { AsyncLocalStorage } from "async_hooks";

type Scope = { assetId: string; chain: string; issuanceType: string };
export type RecordedContracts = { [assetId: string]: { [chain: string]: { [address: string]: number } } };

const scopeStore = new AsyncLocalStorage<Scope>();
const seen: { [assetId: string]: { [chain: string]: Set<string> } } = {};

export function runWithContractRecording<T>(scope: Scope, fn: () => T): T {
  return scopeStore.run(scope, fn);
}

// token identifier whose total supply the pipeline reads; chain defaults to the adapter chain being fetched
export function recordContract(address: string | undefined | null, chain?: string) {
  const scope = scopeStore.getStore();
  if (!scope || scope.issuanceType === "unreleased" || !address || typeof address !== "string") return;
  ((seen[scope.assetId] ??= {})[chain ?? scope.chain] ??= new Set()).add(address);
}

// single definition of "this call reads a token supply": EVM abis are matched strictly, non-EVM view/method names loosely
const isEvmSupplyAbi = (abi: string) => /totalSupply/i.test(abi);
export const isSupplyMethod = (method: string) => /supply/i.test(method);

// non-EVM helpers call this with the method they are about to run and the token it reads
export function recordSupplyRead(method: string, token: string | undefined | null, chain?: string) {
  if (isSupplyMethod(method)) recordContract(token, chain);
}

function recordSupplyCall(chain: string, params: any) {
  try {
    const abi = typeof params?.abi === "string" ? params.abi : params?.abi?.name;
    if (!isEvmSupplyAbi(String(abi))) return;
    const targets = params.calls ? params.calls.map((c: any) => (typeof c === "string" ? c : c?.target ?? params.target)) : [params.target];
    targets.forEach((target: string) => recordContract(target, chain));
  } catch (e) {}
}

let installed = false;
export function installContractRecorder() {
  if (installed) return;
  installed = true;
  const proto: any = sdk.ChainApi.prototype;
  for (const method of ["call", "multiCall"]) {
    const original = proto[method];
    proto[method] = function (this: any, params: any, ...rest: any[]) {
      recordSupplyCall(this.chain, params);
      return original.call(this, params, ...rest);
    };
  }
  const legacy: any = sdk.api.abi;
  for (const method of ["call", "multiCall"]) {
    const original = legacy[method];
    legacy[method] = function (params: any, ...rest: any[]) {
      recordSupplyCall(params?.chain ?? "ethereum", params);
      return original.call(this, params, ...rest);
    };
  }
}

export function getSeenContracts(): { [assetId: string]: { [chain: string]: string[] } } {
  const result: { [assetId: string]: { [chain: string]: string[] } } = {};
  for (const [assetId, chains] of Object.entries(seen))
    for (const [chain, addresses] of Object.entries(chains)) (result[assetId] ??= {})[chain] = [...addresses];
  return result;
}

export const RECORDED_CONTRACTS_TTL_DAYS = 7;

// merge one asset's seen addresses into its stored map (address -> last seen unix seconds), pruning addresses unseen for ttlDays
export function mergeAssetContracts(
  stored: RecordedContracts[string] | undefined,
  seenNow: { [chain: string]: string[] },
  now = Math.round(Date.now() / 1000),
  ttlDays = RECORDED_CONTRACTS_TTL_DAYS
): RecordedContracts[string] {
  const cutoff = now - ttlDays * 86400;
  const result: RecordedContracts[string] = {};
  for (const [chain, addresses] of Object.entries(stored ?? {}))
    for (const [address, lastSeen] of Object.entries(addresses))
      if (lastSeen >= cutoff) (result[chain] ??= {})[address] = lastSeen;
  for (const [chain, addresses] of Object.entries(seenNow))
    for (const address of addresses) (result[chain] ??= {})[address] = now;
  return result;
}

// every stored asset is pruned, including those that recorded nothing this run
export function mergeRecordedContracts(
  stored: RecordedContracts,
  seenNow: { [assetId: string]: { [chain: string]: string[] } },
  now = Math.round(Date.now() / 1000)
): RecordedContracts {
  const result: RecordedContracts = {};
  for (const assetId of new Set([...Object.keys(stored), ...Object.keys(seenNow)])) {
    const contracts = mergeAssetContracts(stored[assetId], seenNow[assetId] ?? {}, now);
    if (Object.keys(contracts).length) result[assetId] = contracts;
  }
  return result;
}

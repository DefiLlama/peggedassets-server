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

function recordSupplyCall(chain: string, params: any) {
  try {
    const abi = typeof params?.abi === "string" ? params.abi : params?.abi?.name;
    if (!/totalSupply/i.test(String(abi))) return;
    const targets = params.target ? [params.target] : (params.calls ?? []).map((c: any) => (typeof c === "string" ? c : c?.target));
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

// merge one asset's seen addresses into its stored map (address -> last seen unix seconds), pruning addresses unseen for ttlDays
export function mergeAssetContracts(
  stored: RecordedContracts[string] | undefined,
  seenNow: { [chain: string]: string[] },
  now = Math.round(Date.now() / 1000),
  ttlDays = 7
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

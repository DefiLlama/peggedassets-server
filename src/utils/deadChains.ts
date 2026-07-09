import * as sdk from '@defillama/sdk'

// Extended from ../../../server/defi/src/config/deadChains.ts (the canonical DefiLlama
// dead-chains list). Keep in sync: when a chain is added there, add it here too.
// Local-only entries (not in the server list) are grouped at the end.
export const DEAD_CHAINS = new Set([
  ...sdk.chainUtils.getDeadChains(),

  // Local-only (not in the server dead-chains list):
  'concordium',
]);

export function isDeadChain(chain: string): boolean {
  return DEAD_CHAINS.has(chain);
}

export function getDeadChainFunction() {
  return () => ({});
}

import * as sdk from '@defillama/sdk'

export const DEAD_CHAINS = new Set([
  ...sdk.chainUtils.getDeadChains(),

  'concordium',
  'blast', // shut down Oct 2026 (withdrawals via UI closed 2026-10-26)
]);

export function isDeadChain(chain: string): boolean {
  return DEAD_CHAINS.has(chain);
}

export function getDeadChainFunction() {
  return () => ({});
}

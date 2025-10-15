
export const DEAD_CHAINS = new Set([
  'milkomeda',
  'real',
  'concordium'
]);

export function isDeadChain(chain: string): boolean {
  return DEAD_CHAINS.has(chain);
}

export function getDeadChainFunction() {
  return () => ({});
}

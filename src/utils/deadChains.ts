
export const DEAD_CHAINS = new Set([
  'milkomeda',
  'real',
  'concordium',
  'kardia',
  'crab',
]);

export function isDeadChain(chain: string): boolean {
  return DEAD_CHAINS.has(chain);
}

export function getDeadChainFunction() {
  return () => ({});
}

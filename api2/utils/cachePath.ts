import { chainUtils } from '@defillama/sdk';

export function chainCacheSlug(chain: string) {
  return chainUtils.sluggifyString(chainUtils.getChainLabelFromKey(chain.toLowerCase()));
}

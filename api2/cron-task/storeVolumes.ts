// 
// this cron pull stablecoin volume from R2 and store in cache files
//

import { getR2JSONString } from '../../src/utils/r2';
import { storeRouteData } from '../file-cache';

interface DailyVolume {
  timestamp: number;
  chains: Record<string, number>;
  tokens: Record<string, number>;
  baseTokens: Record<string, number>;
  currencies: Record<string, number>;
}

const STORE_KEY = 'stablecoins/dailyVolumes';
export async function storeVolumesRoutes() {
  const r2stablecoinVolumeCache: Record<string, DailyVolume> = await getR2JSONString(STORE_KEY);
  console.log('read volume cache from R2');
  
  if (r2stablecoinVolumeCache) {
    await storeRouteData('stablecoins/volumes/chart-total', formatChartItems(r2stablecoinVolumeCache, 'total'));
    await storeRouteData('stablecoins/volumes/chart-chain-breakdown', formatChartItems(r2stablecoinVolumeCache, 'chains'));
    await storeRouteData('stablecoins/volumes/chart-token-breakdown', formatChartItems(r2stablecoinVolumeCache, 'tokens'));
    await storeRouteData('stablecoins/volumes/chart-currency-breakdown', formatChartItems(r2stablecoinVolumeCache, 'currencies'));
  }
  
  function sumTotal(item: Record<string, number>): number {
    let total = 0;
    for (const value of Object.values(item)) {
      total += value;
    }
    return total;
  }
  
  function formatChartItems(cache: Record<string, DailyVolume>, key: 'total' | 'chains' | 'tokens' | 'currencies'): Array<Array<any>> {
    let chartItems: Array<Array<number>> = [];
    for (const dailyVolume of Object.values(cache)) {
      if (key === 'total') chartItems.push([dailyVolume.timestamp, sumTotal(dailyVolume.chains)]);
      else chartItems.push([dailyVolume.timestamp, (dailyVolume as any)[key]]);
    }
    return chartItems.sort((a, b) => a[0] > b[0] ? 1 : -1);
  }
}

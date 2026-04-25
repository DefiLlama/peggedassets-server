// 
// this cron pull stablecoin volume from R2 and store in cache files
//

import * as sdk from '@defillama/sdk';
import { storeRouteData } from '../file-cache';

interface DailyVolume {
  timestamp: number;
  chains: Record<string, {
    tokens: Record<string, number>;
    currencies: Record<string, number>;
  }>;
}

const R2_STORE_KEY = 'stablecoins/dailyVolumes';
export async function storeVolumesRoutes() {
  const r2stablecoinVolumeCache: Record<string, DailyVolume> = await sdk.cache.readCache(R2_STORE_KEY, { readFromR2Cache: true });
  
  const chainTotalItems: Record<string, Record<string, number>> = {};
  
  const chainTokenBreakdownItems: Record<string, Record<string, Record<string, number>>> = {};
  const chainCurrencyBreakdownItems: Record<string, Record<string, Record<string, number>>> = {};
  
  const tokenTotalItems: Record<string, Record<string, number>> = {};
  const tokenChainBreakdownItems: Record<string, Record<string, Record<string, number>>> = {};
  
  const currencyTotalItems: Record<string, Record<string, number>> = {};
  const currencyChainBreakdownItems: Record<string, Record<string, Record<string, number>>> = {};
  
  for (const dailyVolume of Object.values(r2stablecoinVolumeCache)) {
    chainTotalItems[dailyVolume.timestamp] = chainTotalItems[dailyVolume.timestamp] || {};
    chainTokenBreakdownItems[dailyVolume.timestamp] = chainTokenBreakdownItems[dailyVolume.timestamp] || {};
    chainCurrencyBreakdownItems[dailyVolume.timestamp] = chainCurrencyBreakdownItems[dailyVolume.timestamp] || {};
    
    tokenTotalItems[dailyVolume.timestamp] = tokenTotalItems[dailyVolume.timestamp] || {};
    tokenChainBreakdownItems[dailyVolume.timestamp] = tokenChainBreakdownItems[dailyVolume.timestamp] || {};
    
    currencyTotalItems[dailyVolume.timestamp] = currencyTotalItems[dailyVolume.timestamp] || {};
    currencyChainBreakdownItems[dailyVolume.timestamp] = currencyChainBreakdownItems[dailyVolume.timestamp] || {};
    
    for (const [chain, chains] of Object.entries(dailyVolume.chains)) {
      chainTotalItems[dailyVolume.timestamp][chain] = chainTotalItems[dailyVolume.timestamp][chain] || 0;
      chainTokenBreakdownItems[dailyVolume.timestamp][chain] = chainTokenBreakdownItems[dailyVolume.timestamp][chain] || {};
      chainCurrencyBreakdownItems[dailyVolume.timestamp][chain] = chainCurrencyBreakdownItems[dailyVolume.timestamp][chain] || {};
      
      for (const [token, volume] of Object.entries(chains.tokens)) {
        chainTotalItems[dailyVolume.timestamp][chain] += volume;
        
        chainTokenBreakdownItems[dailyVolume.timestamp][chain][token] = chainTokenBreakdownItems[dailyVolume.timestamp][chain][token] || 0;
        chainTokenBreakdownItems[dailyVolume.timestamp][chain][token] += volume;
        
        tokenTotalItems[dailyVolume.timestamp][token] = tokenTotalItems[dailyVolume.timestamp][token] || 0;
        tokenTotalItems[dailyVolume.timestamp][token] += volume;
        
        tokenChainBreakdownItems[dailyVolume.timestamp][token] = tokenChainBreakdownItems[dailyVolume.timestamp][token] || {};
        tokenChainBreakdownItems[dailyVolume.timestamp][token][chain] = tokenChainBreakdownItems[dailyVolume.timestamp][token][chain] || 0;
        tokenChainBreakdownItems[dailyVolume.timestamp][token][chain] += volume;
      }
      
      for (const [currency, volume] of Object.entries(chains.currencies)) {
        chainCurrencyBreakdownItems[dailyVolume.timestamp][chain][currency] = chainCurrencyBreakdownItems[dailyVolume.timestamp][chain][currency] || 0;
        chainCurrencyBreakdownItems[dailyVolume.timestamp][chain][currency] += volume;
        
        currencyTotalItems[dailyVolume.timestamp][currency] = currencyTotalItems[dailyVolume.timestamp][currency] || 0;
        currencyTotalItems[dailyVolume.timestamp][currency] += volume;
        
        currencyChainBreakdownItems[dailyVolume.timestamp][currency] = currencyChainBreakdownItems[dailyVolume.timestamp][currency] || {};
        currencyChainBreakdownItems[dailyVolume.timestamp][currency][chain] = currencyChainBreakdownItems[dailyVolume.timestamp][currency][chain] || 0;
        currencyChainBreakdownItems[dailyVolume.timestamp][currency][chain] += volume;
      }
    }
  }
  
  const chartTotal: Array<Array<number>> = [];
  const chartTotalChainBreakdown: Array<Array<any>> = [];
  const chartTotalTokenBreakdown: Array<Array<any>> = [];
  const chartTotalCurrencyBreakdown: Array<Array<any>> = [];
  for (const [timestamp, chains] of Object.entries(chainTotalItems)) {
    chartTotal.push([Number(timestamp), sumTotal(chains)]);
    chartTotalChainBreakdown.push([Number(timestamp), chains]);
  }
  for (const [timestamp, tokens] of Object.entries(tokenTotalItems)) {
    chartTotalTokenBreakdown.push([Number(timestamp), tokens]);
  }
  for (const [timestamp, currencies] of Object.entries(currencyTotalItems)) {
    chartTotalCurrencyBreakdown.push([Number(timestamp), currencies]);
  }
  await storeRouteData('volume/chart-total', sortByFirstItemIsNumber(chartTotal));
  await storeRouteData('volume/chart-total-chain-breakdown', sortByFirstItemIsNumber(chartTotalChainBreakdown));
  await storeRouteData('volume/chart-total-token-breakdown', sortByFirstItemIsNumber(chartTotalTokenBreakdown));
  await storeRouteData('volume/chart-total-currency-breakdown', sortByFirstItemIsNumber(chartTotalCurrencyBreakdown));

  const chartChainTotal: Record<string, Array<Array<any>>> = {};
  const chartChainTokenBreakdown: Record<string, Array<Array<any>>> = {};
  const chartChainCurrencyBreakdown: Record<string, Array<Array<any>>> = {};
  for (const [timestamp, chainTokenBreakdown] of Object.entries(chainTokenBreakdownItems)) {
    for (const [chain, tokenBreakdown] of Object.entries(chainTokenBreakdown)) {
      chartChainTotal[chain] = chartChainTotal[chain] || [];
      chartChainTotal[chain].push([Number(timestamp), sumTotal(tokenBreakdown)]);
      
      chartChainTokenBreakdown[chain] = chartChainTokenBreakdown[chain] || [];
      chartChainTokenBreakdown[chain].push([Number(timestamp), tokenBreakdown]);
    }
  }
  
  for (const [timestamp, chainCurrencyBreakdown] of Object.entries(chainCurrencyBreakdownItems)) {
    for (const [chain, currencyBreakdown] of Object.entries(chainCurrencyBreakdown)) {
      chartChainCurrencyBreakdown[chain] = chartChainCurrencyBreakdown[chain] || [];
      chartChainCurrencyBreakdown[chain].push([Number(timestamp), currencyBreakdown]);
    }
  }
  
  for (const [chain, chartItems] of Object.entries(chartChainTotal)) {
    await storeRouteData(`volume/chart-chain-${chain}`, sortByFirstItemIsNumber(chartItems));
  }
  for (const [chain, chartItems] of Object.entries(chartChainTokenBreakdown)) {
    await storeRouteData(`volume/chart-chain-${chain}-token-breakdown`, sortByFirstItemIsNumber(chartItems));
  }
  for (const [chain, chartItems] of Object.entries(chartChainCurrencyBreakdown)) {
    await storeRouteData(`volume/chart-chain-${chain}-currency-breakdown`, sortByFirstItemIsNumber(chartItems));
  }
  
  const chartTokenTotal: Record<string, Array<Array<any>>> = {};
  const chartTokenChainBreakdownTotal: Record<string, Array<Array<any>>> = {};
  for (const [timestamp, tokenChainBreakdown] of Object.entries(tokenChainBreakdownItems)) {
    for (const [token, chainBreakdown] of Object.entries(tokenChainBreakdown)) {
      chartTokenTotal[token] = chartTokenTotal[token] || [];
      chartTokenTotal[token].push([Number(timestamp), sumTotal(chainBreakdown)]);
      
      chartTokenChainBreakdownTotal[token] = chartTokenChainBreakdownTotal[token] || [];
      chartTokenChainBreakdownTotal[token].push([Number(timestamp), chainBreakdown]);
    }
  }

  for (const [token, chartItems] of Object.entries(chartTokenTotal)) {
    await storeRouteData(`volume/chart-token-${token}`, sortByFirstItemIsNumber(chartItems));
  }
  for (const [token, chartItems] of Object.entries(chartTokenChainBreakdownTotal)) {
    await storeRouteData(`volume/chart-token-${token}-chain-breakdown`, sortByFirstItemIsNumber(chartItems));
  }
  
  console.log('stored volume cache from R2'); 
  
  function sortByFirstItemIsNumber(items: Array<Array<number>>): Array<Array<number>> {
    return items.sort((a: Array<number>, b: Array<number>) => a[0] > b[0] ? 1 : -1);
  }
  
  function sumTotal(item: Record<string, number>): number {
    let total = 0;
    for (const value of Object.values(item)) {
      total += value;
    }
    return total;
  }
}

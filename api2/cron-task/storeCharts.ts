import axios from "axios";
import { dailyPeggedBalances, getLastRecord, hourlyPeggedBalances, hourlyPeggedPrices } from "../../src/peggedAssets/utils/getLastRecord";
import peggedAssets from "../../src/peggedData/peggedData";
import { getClosestDayStartTimestamp, secondsInDay, secondsInHour, } from "../../src/utils/date";
import * as sdk from "@defillama/sdk";
import { normalizeChain } from "../../src/utils/normalizeChain";
import { getHistoricalValues } from "../../src/utils/shared/dynamodb";
import { buildFxRateMap, pegPriceAt } from "../../src/utils/fxRates";
import { balancesUntilDeadFrom, isInactive } from "../../src/utils/listingStatus";
import { buildPriceSeries, resolvePricing, withLatestHourly } from "../../src/utils/pricing";
import { cache } from "../cache";
import getEnv from "../env";
import { storeRouteData } from "../file-cache";
import { chainCacheSlug } from "../utils/cachePath";
import { cachedSeries } from "../utils/currentPricing";

type TokenBalance = {
  [token: string]: number | undefined;
};


export default async function handler() {
  const timeKey = "chart-update-init";
  console.time(timeKey);
  const historicalRates = (await axios.get(`https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/rates/full`))?.data;
  const lastPrices = await getLastRecord(hourlyPeggedPrices);
  await getPeggedAssetsData()
  cache.fxRateMap = buildFxRateMap(historicalRates)
  cache.lastPrices = lastPrices
  cache.priceSeries = buildPriceSeries(withLatestHourly(cache.historicalPrices ?? [], cache.lastPrices))
  console.timeEnd(timeKey)
}

export async function storeChartsPart2(assetChainMap: any) {
  // store overall chart
  const allData = await craftChartsResponse({ assetChainMap, chain: "all" });
  await storeRouteData('charts/all/all', allData)

  // store chain charts
  const chainKeys = new Set<string>(
    Object.values(sdk.chainUtils.chainLabelsToKeyMap as Record<string, string>),
  );
  for (const normalizedChain of chainKeys) {
    const chainData = await craftChartsResponse({ assetChainMap, chain: normalizedChain, });
    await storeRouteData(`charts/${chainCacheSlug(normalizedChain)}`, chainData)
  }

  // store pegged asset charts
  for (const pegged of peggedAssets) {
    const id = pegged.id;
    const chart = await craftChartsResponse({ assetChainMap, peggedID: id });
    await storeRouteData(`charts/all/${id}`, chart)
  }
}

async function getPeggedAssetsData() {
  if (!cache.peggedAssetsData) cache.peggedAssetsData = {}

  await Promise.all(peggedAssets.map(async (pegged) => {
    const lastBalance = await getLastRecord(hourlyPeggedBalances(pegged.id));
    const allBalances = cache.peggedAssetsData[pegged.id]?.balances || []
    const highestSK = allBalances.reduce((highest: any, item: any) => Math.max(highest, item.SK), -1)
    const pullData = !lastBalance || (lastBalance.SK - highestSK > secondsInDay) // if last item on the table is more than 1 day older than the last balance, pull data
    if (pullData) {
      console.info('fetching new data for', pegged.id)
      const newItems = await getHistoricalValues(dailyPeggedBalances(pegged.id), highestSK)
      allBalances.push(...newItems)
    }
    cache.peggedAssetsData[pegged.id] = {
      balances: allBalances,
      lastBalance
    }
  }))

  replaceAvalanceAvax(cache.peggedAssetsData) // convert all 'avalanche' keys to 'avax'
  return cache.peggedAssetsData
}

function replaceAvalanceAvax(obj: any) {
  if (typeof obj !== 'object' || obj === null) {
    return; // Not an object or is null, do nothing
  }

  if (obj.hasOwnProperty('avalanche')) {
    obj['avax'] = obj['avalanche']; // Create 'avax' key with 'avalanche' value
    delete obj['avalanche']; // Remove 'avalanche' key
  }

  // Recursively apply to all object values
  Object.values(obj).forEach(value => {
    if (typeof value === 'object') {
      replaceAvalanceAvax(value); // Recursive call
    }
  });
}

const formatTokenBalance = (tokenBalance: TokenBalance) => {
  let formattedTokenBalance = {} as TokenBalance;
  for (const token in tokenBalance) {
    const balance = tokenBalance[token];
    formattedTokenBalance[token] = balance ? parseFloat(balance.toFixed(2)) : 0;
  }
  return formattedTokenBalance;
};

const _assetCache: any = {};
let lastDailyTimestamp = 0;

export function craftChartsResponse(
  { chain = 'all', peggedID, startTimestamp, assetChainMap, excludeDoublecounted, }: {
    chain?: string,
    peggedID?: string,
    startTimestamp?: string | number,
    assetChainMap: {
      [asset: string]: Set<string>
    },
    excludeDoublecounted?: boolean,
  }
) {
  if (startTimestamp && typeof startTimestamp === 'string') startTimestamp = parseInt(startTimestamp)

  const filterChart = (chart: any) => {
    if (startTimestamp) chart = chart.filter((entry: any) => entry?.date >= startTimestamp)
    return chart.filter((entry: any) => entry)
  }

  const { fxRateMap, peggedAssetsData, } = cache as any
  const priceSeries = cachedSeries()
  const maxAgeDays = getEnv().priceCarryMaxDays
  const sumDailyBalances = {} as {
    [timestamp: number]: {
      circulating: TokenBalance;
      unreleased: TokenBalance;
      totalCirculatingUSD: TokenBalance;
      totalMintedUSD: TokenBalance;
      totalBridgedToUSD: TokenBalance;
    };
  };

  const normalizedChain = normalizeChain(chain!);

  /*
   * whenever "chain" and "peggedAsset", and peggedAsset has no entry in lastBalance for that chain,
   * historicalPeggedBalances is empty. Not sure exactly where that's happening.
   */
  const historicalPeggedBalances = peggedAssets.map((pegged) => {
    if (peggedID && pegged.id !== peggedID) return;
    if (excludeDoublecounted && pegged.doublecounted) return;
    const chainMap = assetChainMap[pegged.id];
    if (!chainMap || chain !== "all" && !chainMap?.has(chain)) return; // if the coin is not found an given chain or coin has no data, dont process it
    if (!_assetCache[pegged.id]) addToAssetCache(pegged);
    return _assetCache[pegged.id];
  }).filter((i) => i);


  function addToAssetCache(pegged: any) {
    const { balance: lastBalance, balances } = peggedAssetsData[pegged.id]
    let historicalBalance = { Items: balancesUntilDeadFrom(balances ?? [], pegged) } as any;
    if (historicalBalance.Items.length < 1) return undefined;

    const lastDailyItem = historicalBalance.Items[historicalBalance.Items.length - 1];
    if (lastBalance && lastBalance.SK > lastDailyItem.SK && lastDailyItem.SK + secondsInHour * 25 > lastBalance.SK) {
      lastBalance.SK = lastDailyItem.SK;
      historicalBalance.Items[historicalBalance.Items.length - 1] = lastBalance;
    }
    const lastTimestamp = getClosestDayStartTimestamp(historicalBalance.Items[historicalBalance.Items.length - 1].SK);
    lastDailyTimestamp = Math.max(lastDailyTimestamp, lastTimestamp);

    _assetCache[pegged.id] = {
      pegged,
      historicalBalance: [...historicalBalance.Items],
      lastTimestamp,
    };
  }

  historicalPeggedBalances.forEach((peggedBalance) => {
    let { historicalBalance: _historicalBalance, pegged, lastTimestamp } = peggedBalance;
    const historicalBalance = [..._historicalBalance];
    const pegType = pegged.pegType;
    const peggedGeckoID = pegged.gecko_id;
    const lastBalance = historicalBalance[historicalBalance.length - 1];

    // fill missing data with last available data
    while (lastTimestamp < lastDailyTimestamp) {
      if (isInactive(pegged)) break; // don't extend inactive assets beyond their last real data point
      lastTimestamp = getClosestDayStartTimestamp(lastTimestamp + 24 * secondsInHour);
      const syntheticBalance = { ...lastBalance, SK: lastTimestamp };
      historicalBalance.push(syntheticBalance);
      peggedBalance.historicalBalance.push(syntheticBalance);
      peggedBalance.lastTimestamp = lastTimestamp;
    }

    historicalBalance.map((item: any) => {
      const timestamp = getClosestDayStartTimestamp(item.SK)
      let itemBalance: any = {};

      const pricing = resolvePricing(
        { gecko_id: peggedGeckoID, pegType },
        { series: priceSeries, daySK: timestamp, pegPrice: pegPriceAt(fxRateMap, pegType, timestamp) },
        { maxAgeDays }
      );
      const price = pricing.price;
      const isAllChain = (chain === "all");

      if (isAllChain) {
        if (!item.totalCirculating.circulating) {
          throw new Error(
            `missing totalCirculating for ${peggedGeckoID} at timestamp ${timestamp}`
          );
        }
      
        const itemPegType = Object.keys(item.totalCirculating.circulating)?.[0];
        if (item.totalCirculating.circulating && itemPegType !== pegType) return;
      
        itemBalance.circulating = item.totalCirculating.circulating ?? { [pegType]: 0 };
        if (item.totalCirculating.unreleased) {
          itemBalance.unreleased = item.totalCirculating.unreleased;
        }
        itemBalance.bridgedTo = { [pegType]: 0 };
        itemBalance.minted = { [pegType]: 0 };
      } else {
        let chainData: any = null;
        for (const [itemChain, data] of Object.entries(item)) {
          if (itemChain === 'SK' || itemChain === 'totalCirculating') continue;
          const itemChainNormalized = normalizeChain(itemChain);
          if (itemChainNormalized === normalizedChain) {
            chainData = data;
            break;
          }
        }
      
        if (chainData?.circulating) {
          const itemPegType = Object.keys(chainData.circulating)?.[0];
          if (chainData.circulating && itemPegType !== pegType) return;
        }
      
        itemBalance.circulating = chainData?.circulating ?? { [pegType]: 0 };
        itemBalance.unreleased = chainData?.unreleased ?? { [pegType]: 0 };
        itemBalance.bridgedTo = chainData?.bridgedTo ?? { [pegType]: 0 };
        itemBalance.minted = chainData?.minted ?? { [pegType]: 0 };
      
        if (itemBalance.circulating === undefined) {
          return;
        }
      }

      // need stricter checks here
      if (itemBalance !== null) {
        sumDailyBalances[timestamp] = sumDailyBalances[timestamp] || {};
        sumDailyBalances[timestamp].circulating =
          sumDailyBalances[timestamp].circulating || {};
        sumDailyBalances[timestamp].circulating[pegType] =
          (sumDailyBalances[timestamp].circulating[pegType] ?? 0) +
          itemBalance.circulating[pegType];

        sumDailyBalances[timestamp].unreleased =
          sumDailyBalances[timestamp].unreleased || {};
        sumDailyBalances[timestamp].unreleased[pegType] =
          (sumDailyBalances[timestamp].unreleased[pegType] ?? 0) +
          itemBalance.unreleased[pegType];

        sumDailyBalances[timestamp].totalCirculatingUSD =
          sumDailyBalances[timestamp].totalCirculatingUSD || {};
        sumDailyBalances[timestamp].totalCirculatingUSD[pegType] =
          (sumDailyBalances[timestamp].totalCirculatingUSD[pegType] ?? 0) +
          itemBalance.circulating[pegType] * price;

        sumDailyBalances[timestamp].totalMintedUSD =
          sumDailyBalances[timestamp].totalMintedUSD || {};
        sumDailyBalances[timestamp].totalMintedUSD[pegType] =
          (sumDailyBalances[timestamp].totalMintedUSD[pegType] ?? 0) +
          (itemBalance.minted[pegType] - itemBalance.unreleased[pegType]) *
          price;

        sumDailyBalances[timestamp].totalBridgedToUSD =
          sumDailyBalances[timestamp].totalBridgedToUSD || {};
        sumDailyBalances[timestamp].totalBridgedToUSD[pegType] =
          (sumDailyBalances[timestamp].totalBridgedToUSD[pegType] ?? 0) +
          itemBalance.bridgedTo[pegType] * price;
        if (chain === "all") {
          sumDailyBalances[timestamp].totalMintedUSD[pegType] = 0;
          sumDailyBalances[timestamp].totalBridgedToUSD[pegType] = 0;
        }
      } else {
        console.log(
          "itemBalance is invalid",
          itemBalance,
          item,
          pegged,
          lastTimestamp,
          historicalBalance
        );
      }
    })
  })

  const response = Object.entries(sumDailyBalances).map(
    ([timestamp, balance]) => ({
      date: timestamp,
      totalCirculating: formatTokenBalance(balance.circulating),
      totalUnreleased: formatTokenBalance(balance.unreleased),
      totalCirculatingUSD: formatTokenBalance(balance.totalCirculatingUSD),
      totalMintedUSD: formatTokenBalance(balance.totalMintedUSD),
      totalBridgedToUSD: formatTokenBalance(balance.totalBridgedToUSD),
    })
  );

  return filterChart(response)
}

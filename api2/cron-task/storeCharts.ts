import { getHistoricalValues } from "../../src/utils/shared/dynamodb";
import peggedAssets from "../../src/peggedData/peggedData";
import {
  dailyPeggedBalances,
  getLastRecord,
  hourlyPeggedBalances,
  hourlyPeggedPrices,
} from "../../src/peggedAssets/utils/getLastRecord";
import axios from "axios";
import { secondsInHour, secondsInDay, getClosestDayStartTimestamp, } from "../../src/utils/date";
import backfilledChains from "../../src/peggedData/backfilledChains";
import { storeRouteData } from "../file-cache";
import {
  chainCoingeckoIds,
  normalizedChainReplacements,
  normalizeChain,
} from "../../src/utils/normalizeChain";

import { cache } from "../cache";



type TokenBalance = {
  [token: string]: number | undefined;
};


export default async function handler() {
  const timeKey = "chart-update-init";
  console.time(timeKey);
  const historicalRates = (
    await axios.get(
      `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/rates/full`
    )
  )?.data;
  const lastPrices = await getLastRecord(hourlyPeggedPrices);
  const priceTimestamps = cache.historicalPrices?.map((item: any) => item.SK);
  const rateTimestamps = historicalRates?.map((entry: any) => entry.date);
  await getPeggedAssetsData()
  cache.historicalRates = historicalRates
  cache.lastPrices = lastPrices
  cache.priceTimestamps = priceTimestamps
  cache.rateTimestamps = rateTimestamps
  console.timeEnd(timeKey)

}

export async function storeChartsPart2(assetChainMap: any) {
  const { lastPrices, historicalRates, priceTimestamps, rateTimestamps, } = cache

  const commonOptions = {
    assetChainMap,
    lastPrices,
    historicalPrices: cache.historicalPrices,
    historicalRates,
    priceTimestamps,
    rateTimestamps,
    peggedAssetsData: cache.peggedAssetsData,
  }
  // store overall chart
  const allData = await craftChartsResponse({ ...commonOptions, chain: "all" });
  await storeRouteData('charts/all/all', allData)

  // store chain charts
  const chains = [Object.keys(chainCoingeckoIds), Object.values(normalizedChainReplacements)].flat()
  for (let chain of chains) {
    const normalizedChain = normalizeChain(chain);
    const chainData = await craftChartsResponse({ ...commonOptions, chain: normalizedChain, });
    // if (chainData.length) {
    await storeRouteData(`charts/${normalizedChain}`, chainData)
    // } else {
    //   console.log(`No data for ${chain} ${normalizedChain}`)
    // }
  }

  // store pegged asset charts
  for (const pegged of peggedAssets) {
    const id = pegged.id;
    const chart = await craftChartsResponse({ ...commonOptions, peggedID: id });
    await storeRouteData(`charts/all/${id}`, chart)
  }

}


async function getPeggedAssetsData() {
  if (!cache.peggedAssetsData)
    cache.peggedAssetsData = {}

  await Promise.all(peggedAssets.map(async (pegged) => {

    const lastBalance = await getLastRecord(hourlyPeggedBalances(pegged.id));
    const allBalances = cache.peggedAssetsData[pegged.id]?.balances || []
    const highestSK = allBalances.reduce((highest, item) => Math.max(highest, item.SK), -1)
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

  const { SK, ...terraLastBalance } = cache.peggedAssetsData['3'].lastBalance
  cache.peggedAssetsData['3'].balances.forEach((item: any, index: any) => { // the token deppeged after this
    if (item.SK > 1655891865) {
      cache.peggedAssetsData['3'].balances[index] = { ...item, ...terraLastBalance }
      return
    }
  })

  replaceAvalanceAvax(cache.peggedAssetsData) // convert all 'avalanche' keys to 'avax'
  return cache.peggedAssetsData
}

function replaceAvalanceAvax(obj) {
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

// needed because new daily rates is not stored on same day it is queried for
function ratesCompareFn(a: number, b: number) {
  if (Math.abs(a - b) <= secondsInDay) return 0;
  return a - b;
}

// this should not get prices from the previous day
function pricesCompareFn(a: number, b: number) {
  if (Math.abs(a - b) < secondsInDay) return 0;
  return a - b;
}

// returns index of element or -n-1 where n is index of closest element
// uses compare_fn to consider timestamps the same if they are within 1 day range
function timestampsBinarySearch(
  ar: number[],
  el: number,
  compare_fn: (a: number, b: number) => number
) {
  var m = 0;
  var n = ar.length - 1;
  while (m <= n) {
    var k = (n + m) >> 1;
    var cmp = compare_fn(el, ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function extractResultOfBinarySearch(ar: any[], binarySearchResult: number) {
  if (binarySearchResult < 0) {
    if (binarySearchResult === -1 || ar.length < -binarySearchResult) {
      return null;
    }
    return ar[-binarySearchResult - 1];
  }
  return ar[binarySearchResult];
}

const _assetCache: any = {};
let lastDailyTimestamp = 0;

export function craftChartsResponse(
  { chain = 'all', peggedID, startTimestamp, assetChainMap, }: {
    chain?: string,
    peggedID?: string,
    startTimestamp?: string | number,
    assetChainMap: {
      [asset: string]: Set<string>
    }
  }
) {
  if (startTimestamp && typeof startTimestamp === 'string') startTimestamp = parseInt(startTimestamp)

  const filterChart = (chart: any) => {
    if (startTimestamp) chart = chart.filter((entry: any) => entry?.date >= startTimestamp)
    return chart.filter((entry: any) => entry)
  }

  const { historicalPrices, historicalRates, lastPrices, priceTimestamps, rateTimestamps, peggedAssetsData, } = cache as any
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
    if (peggedID && pegged.id !== peggedID) {
      return;
    }
    // Skip double-counted assets for chain and all charts
    if (!peggedID && pegged.doublecounted === true) {
      return;
    }
    const chainMap = assetChainMap[pegged.id];
    if (!chainMap || chain !== "all" && !chainMap?.has(chain)) return; // if the coin is not found an given chain or coin has no data, dont process it
    if (!_assetCache[pegged.id]) addToAssetCache(pegged);
    return _assetCache[pegged.id];
  }).filter((i) => i);


  function addToAssetCache(pegged: any) {

    const { balance: lastBalance, balances } = peggedAssetsData[pegged.id]

    // if (chain !== "all" && !lastBalance?.[normalizedChain])
    //   return undefined;

    let historicalBalance = { Items: balances } as any;

    if (historicalBalance.Items === undefined || historicalBalance.Items.length < 1)
      return undefined;

    const lastDailyItem = historicalBalance.Items[historicalBalance.Items.length - 1];
    if (
      lastBalance !== undefined &&
      lastBalance.SK > lastDailyItem.SK &&
      lastDailyItem.SK + secondsInHour * 25 > lastBalance.SK
    ) {
      lastBalance.SK = lastDailyItem.SK;
      historicalBalance.Items[historicalBalance.Items.length - 1] =
        lastBalance;
    }
    const lastTimestamp = getClosestDayStartTimestamp(
      historicalBalance.Items[historicalBalance.Items.length - 1].SK
    );
    lastDailyTimestamp = Math.max(lastDailyTimestamp, lastTimestamp);

    _assetCache[pegged.id] = {
      pegged,
      historicalBalance: historicalBalance.Items,
      lastTimestamp,
    };
  }

  const lastDailyItem = historicalPrices[historicalPrices.length - 1];
  if (
    lastPrices !== undefined &&
    lastPrices.SK > lastDailyItem.SK &&
    lastDailyItem.SK + secondsInHour * 25 > lastPrices.SK
  ) {
    lastPrices.SK = lastDailyItem.SK;
    historicalPrices[historicalPrices.length - 1] = lastPrices;
  }

  historicalPeggedBalances.map((peggedBalance) => {
    let { historicalBalance, pegged, lastTimestamp } = peggedBalance;
    const pegType = pegged.pegType;
    const peggedGeckoID = pegged.gecko_id;
    const lastBalance = historicalBalance[historicalBalance.length - 1];

    // fill missing data with last available data
    while (lastTimestamp < lastDailyTimestamp) {
      lastTimestamp = getClosestDayStartTimestamp(lastTimestamp + 24 * secondsInHour);
      historicalBalance.push({
        ...lastBalance,
        SK: lastTimestamp,
      });
      peggedBalance.lastTimestamp = lastTimestamp;
    }

    historicalBalance.map((item: any) => {
      const timestamp = getClosestDayStartTimestamp(item.SK)
      let itemBalance: any = {};

      const closestPriceIndex = timestampsBinarySearch(priceTimestamps, timestamp, pricesCompareFn);
      const closestPrices = extractResultOfBinarySearch(historicalPrices, closestPriceIndex);

      let fallbackPrice = 1;
      const historicalPrice = closestPrices?.prices[peggedGeckoID];
      if (pegType === "peggedVAR") {
        fallbackPrice = 0;
      } else if (pegType !== "peggedUSD" && !historicalPrice) {
        const closestRatesIndex = timestampsBinarySearch(rateTimestamps, timestamp, ratesCompareFn);

        const closestRates = extractResultOfBinarySearch(historicalRates, closestRatesIndex);
        const ticker = pegType.slice(-3);
        fallbackPrice = 1 / closestRates?.rates?.[ticker];
        if (typeof fallbackPrice !== "number") {
          fallbackPrice = 0;
        }
      }

      const price = historicalPrice ? historicalPrice : fallbackPrice;

      if (chain === "all") {
        if (!item.totalCirculating.circulating) {
          throw new Error(
            `missing totalCirculating for ${peggedGeckoID} at timestamp ${timestamp}`
          );
        }
        const itemPegType = Object.keys(
          item.totalCirculating.circulating
        )?.[0];
        if (
          item.totalCirculating.circulating &&
          !(itemPegType === pegType)
        ) {
          if (peggedGeckoID !== "bitcoin-usd-btcfi")
            console.log(
              `pegType mismatch for ${peggedGeckoID}: ${pegType} and ${itemPegType}`
            );
        }

        itemBalance.circulating = item.totalCirculating.circulating ?? {
          [pegType]: 0,
        };
        if (item.totalCirculating.unreleased) {
          itemBalance.unreleased = item.totalCirculating.unreleased;
        }
        itemBalance.bridgedTo = { [pegType]: 0 };
        itemBalance.minted = { [pegType]: 0 };
      } else {
        if (item[normalizedChain]?.circulating) {
          const itemPegType = Object.keys(
            item[normalizedChain].circulating
          )?.[0];
          if (
            item[normalizedChain]?.circulating &&
            !(itemPegType === pegType)
          ) {
            if (peggedGeckoID !== "bitcoin-usd-btcfi")
              console.log(
                `pegType mismatch for ${peggedGeckoID}: ${pegType} and ${itemPegType}`
              );
          }
        }

        itemBalance.circulating = item[normalizedChain]?.circulating ?? {
          [pegType]: 0,
        };
        itemBalance.unreleased = item[normalizedChain]?.unreleased ?? {
          [pegType]: 0,
        };
        itemBalance.bridgedTo = item[normalizedChain]?.bridgedTo ?? {
          [pegType]: 0,
        };
        itemBalance.minted = item[normalizedChain]?.minted ?? {
          [pegType]: 0,
        };
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

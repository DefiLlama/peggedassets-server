import {
  successResponse,
  wrap,
  IResponse,
  errorResponse,
} from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";
import dynamodb from "./utils/shared/dynamodb";
import {
  getLastRecord,
  hourlyPeggedBalances,
  hourlyPeggedPrices,
} from "./peggedAssets/utils/getLastRecord";
import { normalizeChain } from "./utils/normalizeChain";
import {
  secondsInHour,
  secondsInDay,
  getClosestDayStartTimestamp,
} from "./utils/date";
import backfilledChains from "./peggedData/backfilledChains";
const axios = require("axios");

type TokenBalance = {
  [token: string]: number | undefined;
};

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

export async function craftChartsResponse(
  chain: string | undefined,
  peggedID: string | undefined,
  startTimestamp: string | undefined,
  useStoredCharts: boolean = true
) {
  if (chain === undefined) {
    return errorResponse({
      message: "Must include chain or 'all' path parameter.",
    });
  }

  if (chain === "all" && useStoredCharts) {
    try {
      const id = peggedID ? peggedID : "all";
      const chart = (
        await axios.get(
          `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/charts/all/${id}`
        )
      )?.data;
      let filteredChart = chart;
      if (startTimestamp) {
        filteredChart = chart
          .map((entry: any) => {
            if (entry.date < parseInt(startTimestamp)) {
              return null;
            }
            return entry;
          })
          .filter((entry: any) => entry);
      }
      return filteredChart;
    } catch (e) {
      return [];
    }
  }

  if (!peggedID && useStoredCharts) {
    try {
      const normalizedChain = normalizeChain(chain);
      const chart = (
        await axios.get(
          `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/charts/${normalizedChain}`
        )
      )?.data;
      let filteredChart = chart;
      if (startTimestamp) {
        filteredChart = chart
          .map((entry: any) => {
            if (entry.date < parseInt(startTimestamp)) {
              return null;
            }
            return entry;
          })
          .filter((entry: any) => entry);
      }
      return filteredChart;
    } catch (e) {
      return [];
    }
  }

  const sumDailyBalances = {} as {
    [timestamp: number]: {
      circulating: TokenBalance;
      unreleased: TokenBalance;
      totalCirculatingUSD: TokenBalance;
      totalMintedUSD: TokenBalance;
      totalBridgedToUSD: TokenBalance;
    };
  };

  const normalizedChain = normalizeChain(chain);
  let lastDailyTimestamp = 0;
  /*
   * whenever "chain" and "peggedAsset", and peggedAsset has no entry in lastBalance for that chain,
   * historicalPeggedBalances is empty. Not sure exactly where that's happening.
   */
  const historicalPeggedBalances = await Promise.all(
    peggedAssets.map(async (pegged) => {
      if (peggedID && pegged.id !== peggedID) {
        return;
      }
      const lastBalance = await getLastRecord(hourlyPeggedBalances(pegged.id));
      if (chain !== "all" && !lastBalance?.[normalizedChain]) {
        return undefined;
      }
      const defaultStartTimestamp = startTimestamp
        ? parseInt(startTimestamp)
        : 1609372800;
      const earliestTimestamp =
        chain === "all" || backfilledChains.includes(chain ?? "")
          ? defaultStartTimestamp
          : 1652241600; // chains have mostly incomplete data before May 11, 2022
      let startKey = undefined;
      let historicalBalance = { Items: [] } as any;
      do {
        const partialHistoricalBalances = (await dynamodb.query({
          ExpressionAttributeValues: {
            ":pk": `dailyPeggedBalances#${pegged.id}`,
            ":sk": earliestTimestamp,
          },
          KeyConditionExpression: "PK = :pk AND SK >= :sk",
          ExclusiveStartKey: startKey,
        })) as any;
        startKey = partialHistoricalBalances.LastEvaluatedKey;
        historicalBalance.Items = [
          ...historicalBalance.Items,
          ...partialHistoricalBalances.Items,
        ];
      } while (startKey);
      if (
        historicalBalance.Items === undefined ||
        historicalBalance.Items.length < 1
      ) {
        return undefined;
      }

      const lastDailyItem =
        historicalBalance.Items[historicalBalance.Items.length - 1];
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

      return {
        pegged,
        historicalBalance: historicalBalance.Items,
        lastTimestamp,
      };
    })
  );

  const historicalRates = await (
    await axios.get(
      `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/rates/full`
    )
  )?.data;
  if (historicalRates.length < 1) {
    return errorResponse({
      message: "Could not get historical fiat prices.",
    });
  }
  const rateTimestamps = historicalRates?.map((entry: any) => entry.date);

  const historicalPrices = await (
    await axios.get(
      `https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/prices/full`
    )
  )?.data;
  if (historicalPrices.length < 1) {
    return errorResponse({
      message: "Could not get historical prices.",
    });
  }
  const priceTimestamps = historicalPrices?.map((item: any) => item.SK);
  const lastPrices = await getLastRecord(hourlyPeggedPrices());

  const lastDailyItem = historicalPrices[historicalPrices.length - 1];
  if (
    lastPrices !== undefined &&
    lastPrices.SK > lastDailyItem.SK &&
    lastDailyItem.SK + secondsInHour * 25 > lastPrices.SK
  ) {
    lastPrices.SK = lastDailyItem.SK;
    historicalPrices[historicalPrices.length - 1] = lastPrices;
  }

  await Promise.all(
    historicalPeggedBalances.map(async (peggedBalance) => {
      if (peggedBalance === undefined) {
        return;
      }
      let { historicalBalance, pegged, lastTimestamp } = peggedBalance;
      const pegType = pegged.pegType;
      const peggedGeckoID = pegged.gecko_id;
      const lastBalance = historicalBalance[historicalBalance.length - 1];

      while (lastTimestamp < lastDailyTimestamp) {
        lastTimestamp = getClosestDayStartTimestamp(
          lastTimestamp + 24 * secondsInHour
        );
        historicalBalance.push({
          ...lastBalance,
          SK: lastTimestamp,
        });
      }

      await Promise.all(
        historicalBalance.map(async (item: any) => {
          const timestamp = getClosestDayStartTimestamp(item.SK);
          let itemBalance: any = {};

          const closestPriceIndex = timestampsBinarySearch(
            priceTimestamps,
            timestamp,
            pricesCompareFn
          );
          const closestPrices = extractResultOfBinarySearch(
            historicalPrices,
            closestPriceIndex
          );
          let fallbackPrice = 1;
          const historicalPrice = closestPrices?.prices[peggedGeckoID];
          if (pegType === "peggedVAR") {
            fallbackPrice = 0;
          } else if (pegType !== "peggedUSD" && !historicalPrice) {
            const closestRatesIndex = timestampsBinarySearch(
              rateTimestamps,
              timestamp,
              ratesCompareFn
            );
            const closestRates = extractResultOfBinarySearch(
              historicalRates,
              closestRatesIndex
            );
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
              throw new Error(
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
                throw new Error(
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
      );
    })
  );

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

  return response;
}

const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const peggedID = event.queryStringParameters?.stablecoin?.toLowerCase();
  const startTimestamp = event.queryStringParameters?.startts?.toLowerCase();
  const response = await craftChartsResponse(chain, peggedID, startTimestamp);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

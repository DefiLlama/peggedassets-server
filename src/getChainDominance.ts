import {
  successResponse,
  wrap,
  IResponse,
  errorResponse,
} from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";
import dynamodb from "./utils/shared/dynamodb";
import { secondsInDay } from "./utils/date";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getClosestDayStartTimestamp } from "./utils/date";
import { normalizeChain } from "./utils/normalizeChain";
import { secondsInHour } from "./utils/date";

type tokenBalance = {
  [token: string]: number | undefined;
};

function compare_fn(a: number, b: number) {
  if (Math.abs(a - b) < secondsInDay) return 0;
  return a - b;
}

// returns index of element or -n-1 where n is index of closest element
// uses compare_fn to consider timestamps the same if they are within 1 day range
function timestampsBinarySearch(ar: number[], el: number) {
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

export async function craftChartsResponse(chain: string | undefined) {
  const sumDailyBalances = {} as {
    [timestamp: number]: {
      totalCirculating: tokenBalance;
      totalCirculatingUSD: tokenBalance;
      greatestMcap: {
        gecko_id: string;
        symbol: string;
        mcap: number;
      };
    };
  };
  // quick fix; need to update later
  if (chain === "gnosis") {
    chain = "xdai";
  }
  if (chain === "terra%20classic") {
    chain = "terra";
  }

  if (chain === undefined) {
    return errorResponse({
      message: "Must include chain as path parameter.",
    });
  }

  const normalizedChain = normalizeChain(chain);
  let lastDailyTimestamp = 0;
  /*
   * whenever "chain" and "peggedAsset", and peggedAsset has no entry in lastBalance for that chain,
   * historicalPeggedBalances is empty. Not sure exactly where that's happening.
   */
  const historicalPeggedBalances = await Promise.all(
    peggedAssets.map(async (pegged) => {
      const lastBalance = await getLastRecord(hourlyPeggedBalances(pegged.id));
      if (!lastBalance?.[normalizedChain]) {
        return undefined;
      }
      if (
        lastBalance?.[normalizedChain].circulating === undefined &&
        pegged.chain.toLowerCase() !== chain
      ) {
        return undefined;
      }
      const historicalBalance = await dynamodb.query({
        ExpressionAttributeValues: {
          ":pk": `dailyPeggedBalances#${pegged.id}`,
          ":sk": 1652313600,
        },
        KeyConditionExpression: "PK = :pk AND SK > :sk",
      });
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

  await Promise.all(
    historicalPeggedBalances.map(async (peggedBalance) => {
      if (peggedBalance === undefined) {
        return;
      }
      let { historicalBalance, pegged, lastTimestamp } = peggedBalance;
      const pegType = pegged.pegType;
      const peggedGeckoID = pegged.gecko_id;
      const lastBalance = historicalBalance[historicalBalance.length - 1];

      const fallbackPrice = pegType === "peggedUSD" ? 1 : 0; // must be updated with each new pegType added

      while (lastTimestamp < lastDailyTimestamp) {
        lastTimestamp = getClosestDayStartTimestamp(
          lastTimestamp + 24 * secondsInHour
        );
        historicalBalance.push({
          ...lastBalance,
          SK: lastTimestamp,
        });
      }
      const historicalPriceItems = await dynamodb.query({
        ExpressionAttributeValues: {
          ":pk": `dailyPeggedPrices`,
        },
        KeyConditionExpression: "PK = :pk",
      });
      if (
        historicalPriceItems.Items === undefined ||
        historicalPriceItems.Items.length < 1
      ) {
        return undefined;
      }
      const historicalPrices = historicalPriceItems.Items;
      const priceTimestamps = historicalPrices?.map((item) => item.SK);

      await Promise.all(
        historicalBalance.map(async (item) => {
          const timestamp = getClosestDayStartTimestamp(item.SK);
          let itemBalance: any = {};
          
          const closestPriceIndex = timestampsBinarySearch(
            priceTimestamps,
            timestamp
          );
          const closestPrices = extractResultOfBinarySearch(
            historicalPrices,
            closestPriceIndex
          );
          const historicalPrice = closestPrices?.prices[peggedGeckoID];
          const price = historicalPrice ? historicalPrice : fallbackPrice;

          itemBalance.circulating = item[normalizedChain]?.circulating ?? {
            [pegType]: 0,
          };

          itemBalance.mcap = itemBalance.circulating[pegType] * price;

          if (itemBalance.circulating === undefined) {
            if (chain === pegged.chain.toLowerCase()) {
              itemBalance.circulating = item.totalCirculating.circulating ?? {
                [pegType]: 0,
              };
            } else {
              return;
            }
          }

          // need stricter checks here
          if (itemBalance !== null) {
            sumDailyBalances[timestamp] = sumDailyBalances[timestamp] || {};
            sumDailyBalances[timestamp].totalCirculating =
              sumDailyBalances[timestamp].totalCirculating || {};
            sumDailyBalances[timestamp].totalCirculating[pegType] =
              (sumDailyBalances[timestamp].totalCirculating[pegType] ?? 0) +
              itemBalance.circulating[pegType];

              sumDailyBalances[timestamp].totalCirculatingUSD =
              sumDailyBalances[timestamp].totalCirculatingUSD || {};
            sumDailyBalances[timestamp].totalCirculatingUSD[pegType] =
              (sumDailyBalances[timestamp].totalCirculatingUSD[pegType] ?? 0) +
              itemBalance.circulating[pegType] * price;

            sumDailyBalances[timestamp].greatestMcap = sumDailyBalances[
              timestamp
            ].greatestMcap ?? {
              gecko_id: pegged.gecko_id,
              symbol: pegged.symbol,
              mcap: itemBalance.mcap,
            };

            if (
              sumDailyBalances[timestamp].greatestMcap.mcap < itemBalance.mcap
            ) {
              sumDailyBalances[timestamp].greatestMcap = {
                gecko_id: pegged.gecko_id,
                symbol: pegged.symbol,
                mcap: itemBalance.mcap,
              };
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
      totalCirculatingUSD: balance.totalCirculatingUSD,
      greatestMcap: balance.greatestMcap,
    })
  );

  return response;
}

const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const chain = event.pathParameters?.chain?.toLowerCase();
  const response = await craftChartsResponse(chain);
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

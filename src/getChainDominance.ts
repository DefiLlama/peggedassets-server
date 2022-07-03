import {
  successResponse,
  wrap,
  IResponse,
  errorResponse,
} from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";
import dynamodb from "./utils/shared/dynamodb";
import getTVLOfRecordClosestToTimestamp from "./utils/shared/getRecordClosestToTimestamp";
import { secondsInDay } from "./utils/date";
import {
  dailyPeggedPrices,
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getClosestDayStartTimestamp } from "./utils/date";
import { normalizeChain } from "./utils/normalizeChain";
import { secondsInHour } from "./utils/date";

type tokenBalance = {
  [token: string]: number | undefined;
};

export async function craftChartsResponse(chain: string | undefined) {
  const sumDailyBalances = {} as {
    [timestamp: number]: {
      circulating: tokenBalance;
      mcap: number;
      greatestMcap: {
        gecko_id: string;
        symbol: string;
        mcap: number;
      };
    };
  };
  // quick fix; need to update later
  if (chain === "Gnosis" || chain === "gnosis") {
    chain = "xdai";
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
      await Promise.all(
        historicalBalance.map(async (item) => {
          const timestamp = getClosestDayStartTimestamp(item.SK);
          let itemBalance: any = {};

          const priceData = await getTVLOfRecordClosestToTimestamp(
            dailyPeggedPrices(),
            timestamp,
            (secondsInDay * 3) / 2
          );
          const historicalPrice = priceData?.prices?.[peggedGeckoID];
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
            sumDailyBalances[timestamp].circulating =
              sumDailyBalances[timestamp].circulating || {};
            sumDailyBalances[timestamp].circulating[pegType] =
              (sumDailyBalances[timestamp].circulating[pegType] ?? 0) +
              itemBalance.circulating[pegType];

            sumDailyBalances[timestamp].mcap =
              (sumDailyBalances[timestamp].mcap ?? 0) + itemBalance.mcap;

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
      totalCirculating: balance.circulating,
      mcap: balance.mcap,
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

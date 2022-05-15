import { successResponse, wrap, IResponse } from "./utils/shared";
import fetch from "node-fetch";
import peggedAssets, {
  PeggedAsset,
  peggedCategoryList,
} from "./peggedData/peggedData";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import sluggify from "./peggedAssets/utils/sluggifyPegged";
import getRecordClosestToTimestamp from "./utils/shared/getRecordClosestToTimestamp";
import {
  getChainDisplayName,
  getDisplayChain,
  nonChains,
  addToChains,
  transformNewChainName,
} from "./utils/normalizeChain";
import {
  getTimestampAtStartOfDay,
  secondsInDay,
  secondsInWeek,
  secondsBetweenCallsExtra,
} from "./utils/date";
import dynamodb, { TableName } from "./utils/shared/dynamodb";
import { craftPeggedChainsResponse } from "./getPeggedChains";

async function getTVLOfRecordClosestToTimestamp(
  PK: string,
  timestamp: number,
  searchWidth: number
) {
  const record = await getRecordClosestToTimestamp(PK, timestamp, searchWidth);
  if (record.SK === undefined) {
    return null;
  }
  return record;
}

export function getPercentChange(previous: number, current: number) {
  const change = (current / previous) * 100 - 100;
  if (change == Infinity || Number.isNaN(change)) {
    return null;
  }
  return change;
}

export async function craftProtocolsResponse(
  useNewChainNames: boolean,
  getPrices: boolean
) {
  let prices = {} as any;
  if (getPrices) {
    prices = await fetch(
      "https://cocoahomology-datasets.s3.amazonaws.com/peggedPrices.json"
    )
      .then((res: any) => res.json())
      .catch(() => {
        console.error("Could not fetch pegged prices");
      });
  }

  const coinMarketsPromises = [];
  for (let i = 0; i < peggedAssets.length; i += 100) {
    coinMarketsPromises.push(
      dynamodb.batchGet(
        peggedAssets
          .slice(i, i + 100)
          .filter((pegged) => typeof pegged.gecko_id === "string")
          .map((pegged) => ({
            PK: `asset#${pegged.gecko_id}`,
            SK: 0,
          }))
      )
    );
  }
  const coinMarkets = Promise.all(coinMarketsPromises).then((results) =>
    results.reduce((p, c) => {
      c.Responses![TableName].forEach((t) => (p[t.PK] = t));
      return p;
    }, {} as any)
  );
  const response = (
    await Promise.all(
      peggedAssets.map(async (pegged) => {
        const pegType = pegged.pegType;
        const hourlyPK = hourlyPeggedBalances(pegged.id);
        const lastHourlyRecord = await getLastRecord(hourlyPK);
        if (lastHourlyRecord === undefined) {
          return null;
        }
        const lastSK = lastHourlyRecord.SK;
        if (lastSK === undefined) {
          return null;
        }
        const lastDailyPeggedRecord = await getTVLOfRecordClosestToTimestamp(
          hourlyPK,
          lastSK - secondsInDay,
          secondsInDay // temporary, update later
        );
        const lastWeeklyPeggedRecord = await getTVLOfRecordClosestToTimestamp(
          hourlyPK,
          lastSK - secondsInWeek,
          secondsInDay // temporary, update later
        );
        const lastMonthlyPeggedRecord = await getTVLOfRecordClosestToTimestamp(
          hourlyPK,
          lastSK - secondsInDay * 30,
          secondsInDay // temporary, update later
        );
        const chainCirculating = {} as {
          [chain: string]: any;
        };
        const chains: string[] = [];
        Object.entries(lastHourlyRecord).forEach(([chain, issuances]) => {
          if (nonChains.includes(chain)) {
            return;
          }
          const chainDisplayName = getChainDisplayName(chain, useNewChainNames);
          chainCirculating[chainDisplayName] =
            chainCirculating[chainDisplayName] || {};
          chainCirculating[chainDisplayName].current = issuances.circulating;
          chainCirculating[chainDisplayName].circulatingPrevDay =
            lastDailyPeggedRecord && lastDailyPeggedRecord[chain]
              ? lastDailyPeggedRecord[chain].circulating ?? 0
              : 0;
          chainCirculating[chainDisplayName].circulatingPrevWeek =
            lastWeeklyPeggedRecord && lastWeeklyPeggedRecord[chain]
              ? lastWeeklyPeggedRecord[chain].circulating ?? 0
              : 0;
          chainCirculating[chainDisplayName].circulatingPrevMonth =
            lastMonthlyPeggedRecord && lastMonthlyPeggedRecord[chain]
              ? lastMonthlyPeggedRecord[chain].circulating ?? 0
              : 0;
          addToChains(chains, chainDisplayName);
        });
        if (chains.length === 0) {
          const chain = useNewChainNames
            ? transformNewChainName(pegged.chain)
            : pegged.chain;
          if (chainCirculating[chain] === undefined) {
            chainCirculating[chain] =
              lastHourlyRecord.totalCirculating.circulating;
          }
          chains.push(getChainDisplayName(chain, useNewChainNames));
        }
        const dataToReturn = {
          ...pegged,
          slug: sluggify(pegged),
          circulating: lastHourlyRecord.totalCirculating.circulating,
          circulatingPrevDay: lastDailyPeggedRecord
            ? lastDailyPeggedRecord.totalCirculating.circulating
            : 0,
          circulatingPrevWeek: lastWeeklyPeggedRecord
            ? lastWeeklyPeggedRecord.totalCirculating.circulating
            : 0,
          circulatingPrevMonth: lastMonthlyPeggedRecord
            ? lastMonthlyPeggedRecord.totalCirculating.circulating
            : 0,
          chainCirculating,
          chains: chains.sort(
            (a, b) =>
              chainCirculating[b].current[pegType] -
              chainCirculating[a].current[pegType]
          ),
          chain: getDisplayChain(chains),
        } as any;
        if (getPrices) {
          dataToReturn.price = prices[pegged.gecko_id];
        }
        if (typeof pegged.gecko_id === "string") {
          const coingeckoData = (await coinMarkets)[`asset#${pegged.gecko_id}`];
          if (coingeckoData !== undefined) {
            dataToReturn.mcap = coingeckoData.mcap;
          }
        }
        return dataToReturn;
      })
    )
  )
    .filter((pegged) => pegged !== null)
    .sort((a, b) => b.circulating - a.circulating);
  return response;
}

const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  let getPrices = event.queryStringParameters?.includePrices === "true";
  const pegged = await craftProtocolsResponse(true, getPrices);
  let response: any = {
    peggedAssets: pegged,
  };
  if (event.queryStringParameters?.includeChains === "true") {
    const chainData = await craftPeggedChainsResponse();
    response.chains = chainData;
  }
  response["peggedCategories"] = peggedCategoryList;
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

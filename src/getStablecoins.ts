import { successResponse, wrap, IResponse } from "./utils/shared";
import fetch from "node-fetch";
import peggedAssets from "./peggedData/peggedData";
import {
  getLastRecord,
  hourlyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import getRecordClosestToTimestamp from "./utils/shared/getRecordClosestToTimestamp";
import {
  getChainDisplayName,
  nonChains,
  addToChains,
} from "./utils/normalizeChain";
import { secondsInDay, secondsInWeek } from "./utils/date";
import { craftStablecoinChainsResponse } from "./getStablecoinChains";

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

export async function craftProtocolsResponse(
  useNewChainNames: boolean,
  getPrices: boolean
) {
  let prices = {} as any;
  if (getPrices) {
    prices = await fetch(
      "https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/peggedPrices.json"
    )
      .then((res: any) => res.json())
      .catch(() => {
        console.error("Could not fetch pegged prices");
      });
  }

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

        const dataToReturn = {
          id: pegged.id,
          name: pegged.name,
          symbol: pegged.symbol,
          gecko_id: pegged.gecko_id,
          pegType: pegged.pegType,
          priceSource: pegged.priceSource,
          pegMechanism: pegged.pegMechanism,
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
        } as any;
        if (getPrices) {
          dataToReturn.price = prices[pegged.gecko_id] ?? null;
        }
        if (pegged.delisted) {
          dataToReturn.delisted = true;
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
    const chainData = await craftStablecoinChainsResponse();
    response.chains = chainData;
  }

  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

import peggedAssets from "../../src/peggedData/peggedData";
import {
  getChainDisplayName,
  nonChains,
  addToChains,
} from "../../src/utils/normalizeChain";
import { secondsInDay, secondsInWeek } from "../../src/utils/date";
import { craftStablecoinChainsResponse } from "../../src/getStablecoinChains";
import { cache } from "../cache";
import { storeRouteData } from "../file-cache";

function getTVLOfRecordClosestToTimestamp(
  items: any[],
  endSK: number,
  searchWidth: number
) {
  searchWidth = searchWidth * 1.5
  let record: any = null
  for (let i = 0; i < items.length; i++) {
    if (items[i].SK <= endSK && items[i].SK >= endSK - searchWidth) {
      if (!record || items[i].SK > record.SK)
        record = items[i]
    }
  }

  return record;
}

function craftProtocolsResponse(
  useNewChainNames: boolean,
) {
  let prices = cache.peggedPrices!

  const response = (
    peggedAssets.map((pegged) => {
      const pegType = pegged.pegType;
      const { balances, lastBalance } = cache.peggedAssetsData?.[pegged.id] ?? {}
      const lastHourlyRecord = lastBalance
      if (lastHourlyRecord === undefined) {
        return null;
      }
      const lastSK = lastHourlyRecord.SK;
      if (lastSK === undefined) {
        return null;
      }
      const lastDailyPeggedRecord = getTVLOfRecordClosestToTimestamp(
        balances,
        lastSK - secondsInDay,
        secondsInDay // temporary, update later
      );
      const lastWeeklyPeggedRecord = getTVLOfRecordClosestToTimestamp(
        balances,
        lastSK - secondsInWeek,
        secondsInDay // temporary, update later
      );
      const lastMonthlyPeggedRecord = getTVLOfRecordClosestToTimestamp(
        balances,
        lastSK - secondsInDay * 30,
        secondsInDay // temporary, update later
      );
      const chainCirculating = {} as {
        [chain: string]: any;
      };
      const chains: string[] = [];
      Object.entries(lastHourlyRecord).forEach(([chain, issuances]: any) => {
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
      dataToReturn.price = prices[pegged.gecko_id] ?? null;
      if (pegged.delisted) dataToReturn.delisted = true;
      return dataToReturn;
    })
  )
    .filter((pegged) => pegged !== null)
    .sort((a, b) => b.circulating - a.circulating);
  return response;
}

export default async function handler() {
  const pegged = craftProtocolsResponse(true);
  let response: any = {
    peggedAssets: pegged,
  };
  const chainData = await craftStablecoinChainsResponse();
  response.chains = chainData;
  await storeRouteData('stablecoins', response)
  return response;
};


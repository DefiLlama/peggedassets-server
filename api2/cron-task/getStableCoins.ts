import peggedAssets from "../../src/peggedData/peggedData";
import { secondsInDay, secondsInWeek } from "../../src/utils/date";
import {
    addToChains,
    getChainDisplayName,
    nonChains,
    normalizeChain,
} from "../../src/utils/normalizeChain";
import { cache } from "../cache";
import { storeRouteData } from "../file-cache";
import { craftStablecoinChainsResponse } from "./getStablecoinChains";

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
      const fallbackPrice = pegType === "peggedUSD" ? 1 : 0;
      const currentPrice = prices[pegged.gecko_id] || null;
      const price = currentPrice ? currentPrice : fallbackPrice;
      const chainCirculating = {} as {
        [chain: string]: any;
      };
      const chains: string[] = [];
      Object.entries(lastHourlyRecord).forEach(([chain, issuances]: any) => {
        if (nonChains.includes(chain)) {
          return;
        }
        const normalizedChain = normalizeChain(chain);
        const chainDisplayName = getChainDisplayName(normalizedChain, useNewChainNames);
        chainCirculating[chainDisplayName] =
          chainCirculating[chainDisplayName] || {};
        const currentCirculatingUSD = {} as { [key: string]: number };
        Object.keys(issuances.circulating || {}).forEach((pt) => {
          currentCirculatingUSD[pt] = (issuances.circulating[pt] || 0) * price;
        });
        chainCirculating[chainDisplayName].current = currentCirculatingUSD;
        const prevDayCirculating = lastDailyPeggedRecord && lastDailyPeggedRecord[chain]
          ? lastDailyPeggedRecord[chain].circulating ?? {}
          : {};
        const prevDayCirculatingUSD = {} as { [key: string]: number };
        Object.keys(prevDayCirculating).forEach((pt) => {
          prevDayCirculatingUSD[pt] = (prevDayCirculating[pt] || 0) * price;
        });
        chainCirculating[chainDisplayName].circulatingPrevDay = prevDayCirculatingUSD;
        const prevWeekCirculating = lastWeeklyPeggedRecord && lastWeeklyPeggedRecord[chain]
          ? lastWeeklyPeggedRecord[chain].circulating ?? {}
          : {};
        const prevWeekCirculatingUSD = {} as { [key: string]: number };
        Object.keys(prevWeekCirculating).forEach((pt) => {
          prevWeekCirculatingUSD[pt] = (prevWeekCirculating[pt] || 0) * price;
        });
        chainCirculating[chainDisplayName].circulatingPrevWeek = prevWeekCirculatingUSD;
        const prevMonthCirculating = lastMonthlyPeggedRecord && lastMonthlyPeggedRecord[chain]
          ? lastMonthlyPeggedRecord[chain].circulating ?? {}
          : {};
        const prevMonthCirculatingUSD = {} as { [key: string]: number };
        Object.keys(prevMonthCirculating).forEach((pt) => {
          prevMonthCirculatingUSD[pt] = (prevMonthCirculating[pt] || 0) * price;
        });
        chainCirculating[chainDisplayName].circulatingPrevMonth = prevMonthCirculatingUSD;
        addToChains(chains, chainDisplayName);
      });

      const totalCirculating = lastHourlyRecord.totalCirculating.circulating || {};
      const totalCirculatingUSD = {} as { [key: string]: number };
      Object.keys(totalCirculating).forEach((pt) => {
        totalCirculatingUSD[pt] = (totalCirculating[pt] || 0) * price;
      });
      const totalCirculatingPrevDay = lastDailyPeggedRecord
        ? (lastDailyPeggedRecord.totalCirculating.circulating || {})
        : {};
      const totalCirculatingPrevDayUSD = {} as { [key: string]: number };
      Object.keys(totalCirculatingPrevDay).forEach((pt) => {
        totalCirculatingPrevDayUSD[pt] = (totalCirculatingPrevDay[pt] || 0) * price;
      });
      const totalCirculatingPrevWeek = lastWeeklyPeggedRecord
        ? (lastWeeklyPeggedRecord.totalCirculating.circulating || {})
        : {};
      const totalCirculatingPrevWeekUSD = {} as { [key: string]: number };
      Object.keys(totalCirculatingPrevWeek).forEach((pt) => {
        totalCirculatingPrevWeekUSD[pt] = (totalCirculatingPrevWeek[pt] || 0) * price;
      });
      const totalCirculatingPrevMonth = lastMonthlyPeggedRecord
        ? (lastMonthlyPeggedRecord.totalCirculating.circulating || {})
        : {};
      const totalCirculatingPrevMonthUSD = {} as { [key: string]: number };
      Object.keys(totalCirculatingPrevMonth).forEach((pt) => {
        totalCirculatingPrevMonthUSD[pt] = (totalCirculatingPrevMonth[pt] || 0) * price;
      });

      const dataToReturn = {
        id: pegged.id,
        name: pegged.name,
        symbol: pegged.symbol,
        gecko_id: pegged.gecko_id,
        pegType: pegged.pegType,
        priceSource: pegged.priceSource,
        pegMechanism: pegged.pegMechanism,
        circulating: totalCirculatingUSD,
        circulatingPrevDay: totalCirculatingPrevDayUSD,
        circulatingPrevWeek: totalCirculatingPrevWeekUSD,
        circulatingPrevMonth: totalCirculatingPrevMonthUSD,
        chainCirculating,
        chains: chains.sort(
          (a, b) =>
            (chainCirculating[b].current[pegType] || 0) -
            (chainCirculating[a].current[pegType] || 0)
        ),
        ...(pegged.deprecated ? { deprecated: true } : {}),
        ...(pegged.yieldBearing ? { yieldBearing: true } : {}),
      } as any;
      dataToReturn.price = prices[pegged.gecko_id] ?? null;
      if (pegged.delisted) dataToReturn.delisted = true;
      return dataToReturn;
    })
  )
    .filter((pegged) => pegged !== null)
    .sort((a, b) => (b.circulating.peggedUSD || 0) - (a.circulating.peggedUSD || 0));
  return response;
}

export default async function handler({ peggedPrices }: { peggedPrices?: any; } = {}) {
  const pegged = craftProtocolsResponse(true);
  let response: any = {
    peggedAssets: pegged,
  };
  const chainData = craftStablecoinChainsResponse();
  response.chains = chainData;
  await storeRouteData('stablecoins', response)
  return response;
};


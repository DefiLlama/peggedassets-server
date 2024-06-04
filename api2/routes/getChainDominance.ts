import peggedAssets from "../../src/peggedData/peggedData";
import { getTimestampAtStartOfDay } from "../../src/utils/date";
import { normalizeChain } from "../../src/utils/normalizeChain";
import { cache } from "../cache";

type tokenBalance = {
  [token: string]: number | undefined;
};

export function craftChainDominanceResponse(chain: string | undefined) {
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
  if (chain === "ethereumpow") {
    chain = "ethpow";
  }

  if (chain === undefined) 
    throw new Error("Must include chain as path parameter.")

  const normalizedChain = normalizeChain(chain);

  const lastPrices = cache.peggedPrices
  const lastRates = cache.rates

  const lastPeggedBalances = peggedAssets.map((pegged) => {
      const lastBalance = cache.peggedAssetsData?.[pegged.id]?.lastBalance;
      if (!lastBalance?.[normalizedChain]) {
        return undefined;
      }
      if (lastBalance?.[normalizedChain].circulating === undefined) {
        return undefined;
      }

      return {
        pegged,
        lastBalance,
      };
    })

  let timestamp = 0;
  // use most recent timestamp as the timestamp for every pegged balance
  lastPeggedBalances.map(async (peggedBalance) => {
    timestamp = Math.max(
      timestamp,
      getTimestampAtStartOfDay(peggedBalance?.lastBalance?.SK ?? 0)
    );
  })

  lastPeggedBalances.map((peggedBalance) => {
    if (peggedBalance === undefined) {
      return;
    }
    let { pegged, lastBalance } = peggedBalance;
    const pegType = pegged.pegType;
    const peggedGeckoID = pegged.gecko_id;

    let fallbackPrice = 1;
    const historicalPrice = lastPrices?.prices[peggedGeckoID];
    if (pegType === "peggedVAR") {
      fallbackPrice = 0;
    } else if (pegType !== "peggedUSD" && !historicalPrice) {
      const ticker = pegType.slice(-3);
      fallbackPrice = 1 / lastRates?.rates?.[ticker];
      if (typeof fallbackPrice !== "number") {
        fallbackPrice = 0;
      }
    }
    const price = historicalPrice ? historicalPrice : fallbackPrice;

    let itemBalance: any = {};
    itemBalance.circulating = lastBalance[normalizedChain]?.circulating ?? {
      [pegType]: 0,
    };
    itemBalance.mcap = itemBalance.circulating[pegType] * price;
    if (itemBalance.circulating === undefined) {
      return;
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

      sumDailyBalances[timestamp].greatestMcap = sumDailyBalances[timestamp]
        .greatestMcap ?? {
        gecko_id: pegged.gecko_id,
        symbol: pegged.symbol,
        mcap: itemBalance.mcap,
      };

      if (sumDailyBalances[timestamp].greatestMcap.mcap < itemBalance.mcap) {
        sumDailyBalances[timestamp].greatestMcap = {
          gecko_id: pegged.gecko_id,
          symbol: pegged.symbol,
          mcap: itemBalance.mcap,
        };
      }
    } else {
      console.log("itemBalance is invalid", itemBalance, pegged, timestamp);
    }
  })

  const response = Object.entries(sumDailyBalances).map(
    ([timestamp, balance]) => ({
      date: timestamp,
      totalCirculatingUSD: balance.totalCirculatingUSD,
      greatestMcap: balance.greatestMcap,
    })
  );

  return response;
}

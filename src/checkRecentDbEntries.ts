import { wrapScheduledLambda } from "./utils/shared/wrap";
import peggedAssets from "./peggedData/peggedData";
import {
  getLastRecord,
  hourlyPeggedBalances,
  dailyPeggedBalances,
  historicalRates,
  hourlyPeggedPrices,
} from "./peggedAssets/utils/getLastRecord";
import { secondsInHour, secondsInDay } from "./utils/date";
import { executeAndIgnoreErrors } from "./peggedAssets/storePeggedAssets/errorDb";
import { getCurrentUnixTimestamp } from "./utils/date";
import { StoredPeggedAssetIssuance } from "./types";

const chainsToIgnore = ["harmony", "acala"];

export const handler = async (_event: any) => {
  const timestamp = getCurrentUnixTimestamp();
  await Promise.all(
    peggedAssets.map(async (pegged) => {
      const pegType = pegged.pegType;
      const peggedID = pegged.gecko_id;

      const lastHourlyBalance = (await getLastRecord(
        hourlyPeggedBalances(pegged.id)
      )) as StoredPeggedAssetIssuance;
      const lastDailyBalance = (await getLastRecord(
        dailyPeggedBalances(pegged.id)
      )) as StoredPeggedAssetIssuance;

      // checks for null or 0 circulating values in last daily balance
      if (lastDailyBalance) {
        Object.entries(lastDailyBalance).map(([chain, issuances]) => {
          if (
            !(typeof issuances === "string") &&
            !(typeof issuances === "number")
          ) {
            if (
              !issuances.circulating?.[pegType] &&
              !chainsToIgnore.includes(chain)
            ) {
              executeAndIgnoreErrors(
                "INSERT INTO `errors2` VALUES (?, ?, ?, ?)",
                [
                  timestamp,
                  `dailyBalances-${peggedID}`,
                  chain,
                  `0 or null circulating on chain in last daily balance`,
                ]
              );
            }
          }
        });
      }

      // checks if hourly balance is stale
      if (lastHourlyBalance) {
        const SK = lastHourlyBalance.SK;
        if (typeof SK === "number") {
          const lastTimestamp = SK;
          if (Math.abs(timestamp - lastTimestamp) > secondsInHour) {
            executeAndIgnoreErrors("INSERT INTO `stale` VALUES (?, ?, ?)", [
              timestamp,
              `hourlyBalances-${peggedID}`,
              lastTimestamp,
            ]);
          }
        }
      }
    })
  );

  // checks if exchange rates (for fallback prices) is stale
  const lastRates = await getLastRecord(historicalRates());
  if (lastRates) {
    const SK = lastRates.SK;
    if (typeof SK === "number") {
      const lastTimestamp = SK;
      if (Math.abs(timestamp - lastTimestamp) > secondsInDay) {
        executeAndIgnoreErrors("INSERT INTO `stale` VALUES (?, ?, ?)", [
          timestamp,
          `historicalRates`,
          lastTimestamp,
        ]);
      }
    }
  }

  // checks if prices is stale
  const lastPrices = await getLastRecord(hourlyPeggedPrices());
  if (lastPrices) {
    const SK = lastPrices.SK;
    if (typeof SK === "number") {
      const lastTimestamp = SK;
      if (Math.abs(timestamp - lastTimestamp) > secondsInDay) {
        executeAndIgnoreErrors("INSERT INTO `stale` VALUES (?, ?, ?)", [
          timestamp,
          `hourlyPrices`,
          lastTimestamp,
        ]);
      }
    }
  }
};

export default wrapScheduledLambda(handler);

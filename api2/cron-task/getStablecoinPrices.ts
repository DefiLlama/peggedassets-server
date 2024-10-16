
import { secondsInHour } from "../../src/utils/date";
import { cache } from "../cache";

export function craftStablecoinPricesResponse() {
  const historicalPeggedPrices = cache.historicalPrices!

  const lastPrices = cache.lastPrices

  const lastDailyItem =
    historicalPeggedPrices[historicalPeggedPrices.length - 1];
  if (
    lastPrices !== undefined &&
    lastPrices.SK > lastDailyItem.SK &&
    lastDailyItem.SK + secondsInHour * 25 > lastPrices.SK
  ) {
    lastPrices.SK = lastDailyItem.SK;
    historicalPeggedPrices[historicalPeggedPrices.length - 1] = lastPrices;
  }

  let response = historicalPeggedPrices
    ?.map((item) =>
      typeof item === "object"
        ? {
            date: item.SK,
            prices: item.prices,
          }
        : { prices: undefined }
    )
    .filter((item) => item.prices !== undefined);

  return response;
}

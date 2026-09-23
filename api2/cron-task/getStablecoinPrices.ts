
import { cache } from "../cache";
import { getEffectiveDailyHistory } from "./getEffectiveDailyHistory";

export function craftStablecoinPricesResponse() {
  const historicalPeggedPrices = getEffectiveDailyHistory(cache.historicalPrices ?? [], cache.lastPrices)

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

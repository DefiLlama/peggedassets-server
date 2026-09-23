
import { cache } from "../cache";
import { getEffectivePriceHistory } from "./getEffectivePriceHistory";

export function craftStablecoinPricesResponse() {
  const historicalPeggedPrices = getEffectivePriceHistory(cache.historicalPrices ?? [], cache.lastPrices)

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

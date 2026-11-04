
import { withLatestHourly } from "../../src/utils/pricing";
import { cache } from "../cache";

export function craftStablecoinPricesResponse() {
  const historicalPeggedPrices = withLatestHourly(cache.historicalPrices!, cache.lastPrices)

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

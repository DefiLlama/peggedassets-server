
import peggedAssets from "../../src/peggedData/peggedData";
import { getChainDisplayName } from "../../src/utils/normalizeChain";
import { importAdapter } from "../../src/peggedAssets/utils/importAdapter";
import { cache } from "../cache";

type HistoricalTvls = AWS.DynamoDB.DocumentClient.ItemList | undefined;
type HourlyTvl = AWS.DynamoDB.DocumentClient.AttributeMap | undefined;

function replaceLast(historical: HistoricalTvls, last: HourlyTvl) {
  if (historical !== undefined && last !== undefined) {
    historical[historical.length - 1] = last;
  }
}

export function getStablecoinData(peggedID: string | undefined) {
  let prices = cache.peggedPrices!;
  const useNewChainNames = true;
  const useHourlyData = true;

  const peggedData = peggedAssets.find((pegged) => pegged.id === peggedID);
  if (!peggedData) 
    throw new Error( "Pegged asset is not in our database")
  const module = importAdapter(peggedData)
  const { balances, lastBalance } = cache.peggedAssetsData?.[peggedData.id] ?? {}
  const lastBalancesHourlyRecord = lastBalance
  // currently frontend does not use data before May 11, 2022 for individual stablecoins
  const historicalPeggedBalances = balances.filter((item) => item.SK >= 1652241600)

  if (!useHourlyData) {
    replaceLast(historicalPeggedBalances, lastBalancesHourlyRecord);
  }
  let response = peggedData as any;
  if (module.methodology !== undefined) {
    response.methodology = module.methodology;
  }
  if (module.misrepresentedTokens !== undefined) {
    response.misrepresentedTokens = true;
  }
  if (module.hallmarks !== undefined) {
    response.hallmarks = module.hallmarks;
  }
  response.chainBalances = {};
  const currentChainBalances: { [chain: string]: object } = {};
  response.currentChainBalances = currentChainBalances;
  response.price = prices[peggedData.gecko_id] ?? null;

  Object.entries(lastBalancesHourlyRecord!).map(([chain, issuances]: any) => {
    const normalizedChain = chain;
    const displayChainName = getChainDisplayName(chain, useNewChainNames);
    if (chain !== "totalCirculating") {
      currentChainBalances[displayChainName] = issuances.circulating;
    }
    const container = {} as any;

    container.tokens = historicalPeggedBalances
      ?.map((item) =>
        typeof item[normalizedChain] === "object"
          ? {
              date: item.SK,
              circulating: item[normalizedChain].circulating ?? 0,
              minted: item[normalizedChain].minted ?? 0,
              unreleased: item[normalizedChain].unreleased ?? 0,
              bridgedTo: item[normalizedChain].bridgedTo ?? 0,
            }
          : { circulating: undefined }
      )
      .filter((item) => item.circulating !== undefined);
    if (container.tokens !== undefined && container.tokens.length > 0) {
      if (chain === "totalCirculating") {
        response = {
          ...response,
          ...container,
        };
      } else {
        response.chainBalances[displayChainName] = container;
      }
    }
  });

  return response;
}

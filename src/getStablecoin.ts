import {
  wrap,
  IResponse,
  errorResponse,
} from "./utils/shared";
import { getHistoricalValues } from "./utils/shared/dynamodb";
import peggedAssets from "./peggedData/peggedData";
import {
  getLastRecord,
  hourlyPeggedBalances,
  dailyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getChainDisplayName } from "./utils/normalizeChain";
import { wrapResponseOrRedirect } from "./utils/wrapOrRedirect";
import { fetchPrices } from "./utils/fetchPrices";

type HistoricalTvls = AWS.DynamoDB.DocumentClient.ItemList | undefined;
type HourlyTvl = AWS.DynamoDB.DocumentClient.AttributeMap | undefined;

function replaceLast(historical: HistoricalTvls, last: HourlyTvl) {
  if (historical !== undefined && last !== undefined) {
    historical[historical.length - 1] = last;
  }
}

export async function craftProtocolResponse(
  peggedID: string | undefined,
  useNewChainNames: boolean,
  useHourlyData: boolean,
  { peggedPrices }: { peggedPrices?: any; } = {}
) {
  let prices = await fetchPrices(peggedPrices);

  const peggedData = peggedAssets.find((pegged) => pegged.id === peggedID);
  if (peggedData === undefined) {
    return errorResponse({
      message: "Pegged asset is not in our database",
    });
  }
  const [lastBalancesHourlyRecord, historicalPeggedBalances,] =
    await Promise.all([
      getLastRecord(hourlyPeggedBalances(peggedData.id)),
      getHistoricalValues(
        (useHourlyData ? hourlyPeggedBalances : dailyPeggedBalances)(
          peggedData.id
        ),
        1652241600 // currently frontend does not use data before May 11, 2022 for individual stablecoins
      ),
    ]);
  if (!useHourlyData) {
    replaceLast(historicalPeggedBalances, lastBalancesHourlyRecord);
  }
  let response = peggedData as any;
  response.chainBalances = {};
  const currentChainBalances: { [chain: string]: object } = {};
  response.currentChainBalances = currentChainBalances;
  response.price = prices[peggedData.gecko_id] ?? null;

  Object.entries(lastBalancesHourlyRecord!).map(([chain, issuances]) => {
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

const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  const response = await craftProtocolResponse(
    event.pathParameters?.stablecoin,
    true,
    false
  );
  return wrapResponseOrRedirect(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

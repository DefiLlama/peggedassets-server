import {
  successResponse,
  wrap,
  IResponse,
  errorResponse,
} from "./utils/shared";
import fetch from "node-fetch";
import { getHistoricalValues } from "./utils/shared/dynamodb";
import peggedAssets from "./peggedData/peggedData";
import {
  getLastRecord,
  hourlyPeggedBalances,
  dailyPeggedBalances,
} from "./peggedAssets/utils/getLastRecord";
import { getChainDisplayName } from "./utils/normalizeChain";
import { importAdapter } from "./peggedAssets/utils/importAdapter";

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
  useHourlyData: boolean
) {
  let prices = {} as any;
  prices = await fetch(
    "https://llama-stablecoins-data.s3.eu-central-1.amazonaws.com/peggedPrices.json"
  )
    .then((res: any) => res.json())
    .catch(() => {
      console.error("Could not fetch pegged prices");
    });

  const peggedData = peggedAssets.find((pegged) => pegged.id === peggedID);
  if (peggedData === undefined) {
    return errorResponse({
      message: "Pegged asset is not in our database",
    });
  }
  const [lastBalancesHourlyRecord, historicalPeggedBalances, module] =
    await Promise.all([
      getLastRecord(hourlyPeggedBalances(peggedData.id)),
      getHistoricalValues(
        (useHourlyData ? hourlyPeggedBalances : dailyPeggedBalances)(
          peggedData.id
        ),
        1652241600 // currently frontend does not use data before May 11, 2022 for individual stablecoins
      ),
      importAdapter(peggedData),
    ]);
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

  const dataLength = JSON.stringify(response).length;
  if (dataLength > 5.9e6) {
    delete response.tokens;
    Object.keys(response.chainBalances).forEach((chain) => {
      delete response.chainBalances[chain].tokens;
    });
  }

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
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

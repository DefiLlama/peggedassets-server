import { successResponse, wrap, IResponse } from "./utils/shared";
import peggedAssets from "./peggedData/peggedData";

const handler = async (
  _event: AWSLambda.APIGatewayEvent
): Promise<IResponse> => {
  let response: any = Object.fromEntries(peggedAssets.map((pegged) => [pegged.id, pegged]));
  return successResponse(response, 10 * 60); // 10 mins cache
};

export default wrap(handler);

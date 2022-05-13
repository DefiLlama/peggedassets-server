import storePeggedAssets from "./peggedAssets/storePeggedAssets/storePegged";
import { wrapScheduledLambda } from "./utils/shared/wrap";

const handler = async (event: any) => {
  await storePeggedAssets(event.peggedIndexes);
};

export default wrapScheduledLambda(handler);

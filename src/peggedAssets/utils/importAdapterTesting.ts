import { PeggedAsset } from "../../peggedData/typesTesting";
import * as peggedAdapters from "../../adapters/peggedAssets";

export function importAdapter(asset: PeggedAsset) {
  return (peggedAdapters as any)["default"][asset.gecko_id];
}

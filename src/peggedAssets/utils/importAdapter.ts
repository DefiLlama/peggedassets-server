import { PeggedAsset } from "../../peggedData/types";
import * as peggedAdapters from "../../adapters/peggedAssets";

export function importAdapter(asset: PeggedAsset) {
  return (peggedAdapters as any)["default"][asset.gecko_id];
}

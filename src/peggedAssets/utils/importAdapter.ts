import { PeggedAsset } from "../../protocols/types";
import * as peggedAdapters from "../../DefiLlama-Adapters/peggedAssets";

export function importAdapter(asset: PeggedAsset) {
  return (peggedAdapters as any)["default"][asset.gecko_id];
}

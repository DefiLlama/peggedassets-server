import { PeggedAsset } from "../../peggedData/types";
import * as peggedAdapters from "../../adapters/peggedAssets";

export function importAdapter(asset: PeggedAsset) {
  let key =asset.gecko_id
  if (asset.id === '121') key = 'psy' // special case for psy since it is not on coingecko
  return (peggedAdapters as any)["default"][key];
}

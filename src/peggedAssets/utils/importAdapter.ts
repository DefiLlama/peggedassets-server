import { PeggedAsset } from "../../peggedData/types";
import path from "path";

export async function importAdapter(asset: PeggedAsset) {
  let key = asset.module ?? asset.gecko_id
  const modulePath = path.join(__dirname, '../../adapters/peggedAssets', key);
  return (await import(modulePath)).default
}

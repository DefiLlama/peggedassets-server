import { getR2JSON, storeR2JSON } from "../../../api2/utils/r2";
import { getSeenContracts, mergeAssetContracts, RecordedContracts } from "./contractRecorder";

const R2_KEY = "cache/stablecoins-recorded-contracts";

export async function saveRecordedContracts() {
  const stored: RecordedContracts = (await getR2JSON(R2_KEY)) ?? {};
  const merged = { ...stored };
  for (const [assetId, seenNow] of Object.entries(getSeenContracts())) merged[assetId] = mergeAssetContracts(stored[assetId], seenNow);
  await storeR2JSON(R2_KEY, merged);
}

export async function loadRecordedContracts(): Promise<RecordedContracts> {
  return (await getR2JSON(R2_KEY)) ?? {};
}

import { getR2JSON, storeR2JSON } from "../../../api2/utils/r2";
import { getSeenContracts, mergeRecordedContracts, RecordedContracts } from "./contractRecorder";

const R2_KEY = "cache/stablecoins-recorded-contracts";

export async function saveRecordedContracts() {
  const stored: RecordedContracts = (await getR2JSON(R2_KEY)) ?? {};
  await storeR2JSON(R2_KEY, mergeRecordedContracts(stored, getSeenContracts()));
}

export async function loadRecordedContracts(): Promise<RecordedContracts> {
  return (await getR2JSON(R2_KEY)) ?? {};
}

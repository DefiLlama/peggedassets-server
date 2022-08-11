import type { PeggedAsset } from "../../peggedData/peggedDataTesting";

export default (pegged: PeggedAsset) =>
  pegged.name.toLowerCase().split(" ").join("-").split("'").join("");

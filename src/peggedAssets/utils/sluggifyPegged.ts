import type { PeggedAsset } from "../../peggedData/peggedData";

export default (pegged: PeggedAsset) =>
  pegged.name.toLowerCase().split(" ").join("-").split("'").join("");

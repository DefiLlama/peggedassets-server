import type { PeggedAsset } from "../../protocols/peggedData";

export default (pegged: PeggedAsset) =>
  pegged.name.toLowerCase().split(" ").join("-").split("'").join("");

// eNsc - Naira Stablecoin (fiat-backed, 1:1 NGN).
// Same canonical address on every chain via deterministic deploy; each chain is
// a native issuance point (no bridge wrapping), so every chain is `issued`.
// 1:1 fiat-backed with nothing held uncirculated -> unreleased is empty and
// circulating == totalSupply.
//
// NOTE: ENSC has no CoinGecko id yet, so this folder is named with the slug
// `ensc` rather than a gecko id.

const ENSC = "0xF50FFf154E63E510e494929E9eab1E9C5047429E";

const chainContracts = {
  lisk:     { issued: [ENSC], unreleased: [] },
  optimism: { issued: [ENSC], unreleased: [] },
  bsc:      { issued: [ENSC], unreleased: [] },
  polygon:  { issued: [ENSC], unreleased: [] },
  base:     { issued: [ENSC], unreleased: [] },
  mode:     { issued: [ENSC], unreleased: [] },
  arbitrum: { issued: [ENSC], unreleased: [] },
};

import { addChainExports } from "../helper/getSupply";

export default addChainExports(chainContracts, undefined, {
  pegType: "peggedNGN",
  decimals: 18,
});
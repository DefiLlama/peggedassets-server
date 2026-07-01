const chainContracts = {
  hyperliquid: {
    issued: ["0xE2d2959f89B6389DeB624bF076Fe7D9E5401f377"],
  },
};

import { addChainExports } from "../helper/getSupply";

// USDM is a delta-neutral, yield-bearing synthetic dollar issued on HyperEVM
// (6 decimals). It is minted 1:1 against USDC, so the circulating supply equals
// USDM totalSupply; there is no unreleased/reserve tranche to exclude.
const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedUSD",
  decimals: 6,
});

export default adapter;

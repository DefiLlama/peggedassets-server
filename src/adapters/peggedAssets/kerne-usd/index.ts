const chainContracts = {
  base: {
    issued: ["0x5C2EfdF0D8D286959b42308966bc2B97f5680AA3"],
    unreleased: [
      "0xFf3025ec18e301855aB0f36Ec6ECa115a29A5Fbc",
      "0x07eBb486e11BD217e6085eb5ab663e4517595993",
      "0xaBDE1138aa1Ce88d1dF06422C0c3b05D70569803",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
// Peg Stability Modules. Redemptions transfer kUSD into the PSM
// without burning it, so PSM-held kUSD is protocol inventory, not circulating supply.

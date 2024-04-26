const chainContracts = {
  avax: {
    issued: ["0xf14f4ce569cb3679e99d5059909e23b07bd2f387"],
    unreleased: ["0x0b1f9c2211f77ec3fa2719671c5646cf6e59b775"],
  },
  polygon: {
    issued: ["0xf955a6694C6F5629f5Ecd514094B3bd450b59000"],
    unreleased: ["0x7195d3A344106b877F8D5f62CA570Fd25D43D180"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
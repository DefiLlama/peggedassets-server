const chainContracts = {
  fantom: {
    issued: ["0x6Fc9383486c163fA48becdEC79d6058f984f62cA"],
    unreleased: [
      "0xa3b52d5a6d2f8932a5cd921e09da840092349d71", // DAO treasury
      "0x34f93b12ca2e13c6e64f45cfa36eabadd0ba30fc", // DAO multisig
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
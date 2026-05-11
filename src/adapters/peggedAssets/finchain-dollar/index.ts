const chainContracts = {
  ethereum: {
    issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
  },
  monad: {
    issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
  },
  sonic: {
    issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
  },
  avax: {
    issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
  },
  // exsat_mainnet in deployment artifacts maps to xsat in DefiLlama chain keys.
  xsat: {
    issued: ["0x9f6714C302ffe3c3bAFaf2Ccb44201fF64f6371C"],
  },
};

import { addChainExports } from "../helper/getSupply";

const adapter = addChainExports(chainContracts);
export default adapter;

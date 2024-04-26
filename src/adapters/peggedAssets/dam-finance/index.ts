const chainContracts = {
  ethereum: {
    issued: ["0x2FdA8c6783Aa36BeD645baD28a4cDC8769dCD252"],
  },
  moonbeam: {
    issued: ["0xc806B0600cbAfA0B197562a9F7e3B9856866E9bF"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter
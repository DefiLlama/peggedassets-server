const chainContracts = {
  scroll: {
    issued: [
     // "0x6F2A1A886Dbf8E36C4fa9F25a517861A930fBF3A", // old address
      "0xdb9e8f82d6d45fff803161f2a5f75543972b229a" // new address
    ],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
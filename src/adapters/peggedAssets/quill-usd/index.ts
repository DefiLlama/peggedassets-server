const chainContracts = {
  scroll: {
    issued: ["0x6F2A1A886Dbf8E36C4fa9F25a517861A930fBF3A"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
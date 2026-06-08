
const pegType = "peggedCAD";

const chainContracts = {
  ethereum: {
    issued: "0x16f93ebc5320c89efc8701577efe49d14a276a06", pegType
  },
  base: {
    issued: "0x16F93eBC5320C89EfC8701577efe49d14A276a06", pegType
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType});
export default adapter;
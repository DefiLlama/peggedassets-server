const chainContracts = {
  hydradx: {
    issued: ["0x531a654d1696ed52e7275a8cede955e82620f99a"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

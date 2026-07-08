const chainContracts = {
  bsc: {
    issued: ["0x17eafd08994305d8ace37efb82f1523177ec70ee"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

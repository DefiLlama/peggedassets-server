const chainContracts = {
  ethereum: {
    issued: ["0x136471a34f6ef19fe571effc1ca711fdb8e49f2b"],
  },
  bsc: {
    issued: ["0x8d0fa28f221eb5735bc71d3a0da67ee5bc821311"],
  }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
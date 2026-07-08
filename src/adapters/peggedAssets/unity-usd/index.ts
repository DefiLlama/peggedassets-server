const chainContracts = {
  bsc: {
    issued: ["0x61a10e8556bed032ea176330e7f17d6a12a10000"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

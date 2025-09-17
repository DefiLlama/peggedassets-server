

const chainContracts = {
  avax: {
    issued: "0xdbc5192a6b6ffee7451301bb4ec312f844f02b4a",// UTY
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
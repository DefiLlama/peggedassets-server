const chainContracts = {
  saga: {
    issued: "0xB76144F87DF95816e8c55C240F874C554B4553C3",
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

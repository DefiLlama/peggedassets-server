const chainContracts = {
  arbitrum: {
    issued: ["0xBEA0005B8599265D41256905A9B3073D397812E4"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
const chainContracts = {
  base: {
    issued: ["0xc0d3700000987c99b3c9009069e4f8413fd22330"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

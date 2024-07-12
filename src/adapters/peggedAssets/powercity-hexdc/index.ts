const chainContracts = {
  pulse: {
    issued: ["0x1FE0319440A672526916C232EAEe4808254Bdb00"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
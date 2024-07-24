const chainContracts = {
    pulse: {
      issued: ["0x1fe0319440a672526916c232eaee4808254bdb00"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
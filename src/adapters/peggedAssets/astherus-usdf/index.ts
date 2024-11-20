const chainContracts = {
    bsc: {
      issued: ["0x5A110fC00474038f6c02E89C707D638602EA44B5"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
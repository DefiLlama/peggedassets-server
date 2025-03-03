const chainContracts = {
    ethereum: {
      issued: ["0x15700B564Ca08D9439C58cA5053166E8317aa138"],
    },
    sei: {
      bridgedFromETH: ["0x37a4dd9ced2b19cfe8fac251cd727b5787e45269"]
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
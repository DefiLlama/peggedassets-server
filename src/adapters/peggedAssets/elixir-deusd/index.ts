const chainContracts = {
    ethereum: {
      issued: [
        "0x15700B564Ca08D9439C58cA5053166E8317aa138",
      ],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
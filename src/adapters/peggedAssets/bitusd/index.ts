const pegType = "peggedVAR";
const chainContracts = {
    btr: {
      issued: ["0x07373d112edc4570b46996ad1187bc4ac9fb5ed0"], pegType,
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
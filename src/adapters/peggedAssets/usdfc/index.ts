const chainContracts = {
    filecoin: {
      issued: ["0x80B98d3aa09ffff255c3ba4A241111Ff1262F045"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
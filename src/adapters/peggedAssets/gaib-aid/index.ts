const chainContracts = {
    ethereum: {
      issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
    },
    arbitrum: {
        issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
      },
    base: {
        issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
      }, 
    bsc: {
        issued: ["0x18f52b3fb465118731d9e0d276d4eb3599d57596"],
      },  
  };
    
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
const chainContracts = {
  base: {
    issued: ["0xbe92452bb46485AF3308e6d77786bFBE3557808d"], 
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
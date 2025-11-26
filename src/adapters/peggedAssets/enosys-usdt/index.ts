const chainContracts = {
    flare: {
      issued: ["0x96b41289d90444b8add57e6f265db5ae8651df29"],
    }
};
  
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
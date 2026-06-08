const chainContracts = {
  ethereum: {
    issued: ["0x97ccc1c046d067ab945d3cf3cc6920d3b1e54c88"],
  },
};
  
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
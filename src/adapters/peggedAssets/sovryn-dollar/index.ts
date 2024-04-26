const chainContracts = {
  rsk: {
    issued: ["0xc1411567d2670e24d9c4daaa7cda95686e1250aa"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

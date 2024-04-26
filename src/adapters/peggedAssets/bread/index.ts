const chainContracts = {
  xdai: {
    issued: ["0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
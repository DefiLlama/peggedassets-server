const chainContracts = {
  ethereum: {
    issued: ["0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
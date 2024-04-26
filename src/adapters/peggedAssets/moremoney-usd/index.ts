const chainContracts = {
  avax: {
    issued: ["0x0f577433Bf59560Ef2a79c124E9Ff99fCa258948"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
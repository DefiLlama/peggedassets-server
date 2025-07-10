const chainContracts = {
  ethereum: {
    issued: ["0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
const chainContracts = {
  ethereum: {
    issued: ["0xd585aaafa2b58b1cd75092b51ade9fa4ce52f247"],
  },
  arbitrum: {
    issued: ["0xdce765f021410B3266aA0053c93Cb4535F1e12e0"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
const chainContracts: ChainContracts = {
  rbn: {
    issued: ["0x081599E4936D12c46Bd48913B2329115Cd26cbdd"],
  },
};
import { addChainExports } from "../helper/getSupply";
import { ChainContracts } from "../peggedAsset.type";
const adapter = addChainExports(chainContracts);
export default adapter;
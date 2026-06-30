const chainContracts = {
  rsk: {
    issued: ["0x1fe2f558e2120c4bDf4217248D2940043a8E1208"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
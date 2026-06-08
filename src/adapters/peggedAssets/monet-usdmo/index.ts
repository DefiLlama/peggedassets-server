import { addChainExports } from "../helper/getSupply";
import {ChainContracts,
} from "../peggedAsset.type";

const chainContracts:ChainContracts = {
    eden:{
        issued: ["0x9fa8c4d9f33dcce6eacefb6d5cf9736350a330b1"],
    },
};
  
const adapter = addChainExports(chainContracts);
export default adapter;
import { addChainExports } from "../helper/getSupply";
import {ChainContracts,
} from "../peggedAsset.type";

const chainContracts:ChainContracts = {
    sei:{
        issued: ["0x53fdd705873d8259d6d179901fc3fdcb5339f921"],
    },
};
  
const adapter = addChainExports(chainContracts);
export default adapter;
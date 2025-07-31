import {
    ChainContracts,
} from "../peggedAsset.type";

const chainContracts: ChainContracts = {
    bsc: {
        issued: ["0x5519a479Da8Ce3Af7f373c16f14870BbeaFDa265"],
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
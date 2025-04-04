const chainContracts = {
    ethereum: {
        issued: ["0x4274cd7277c7bb0806bd5fe84b9adae466a8da0a"],
    },
    bsc: {
        issued: ["0xAB3dBcD9B096C3fF76275038bf58eAC10D22C61f"],
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

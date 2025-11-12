const chainContracts = {
    ethereum: {
        issued: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    base: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    arbitrum: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    optimism: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    polygon: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    bsc: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;


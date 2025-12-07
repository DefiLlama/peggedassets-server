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
const adapter = addChainExports(chainContracts)
let ethMinted = adapter.ethereum.minted
adapter.ethereum.minted = async function(...args) {
    const chainApi = args[0];

    // USPD was hacked
    if (!chainApi.timestamp || chainApi.timestamp * 1000 > +new Date("2025-12-01T00:00:00Z").getTime()) {
        return {"peggedUSD":2000,"bridges":{"issued":{"not-found":{"amount":2000}}}}
    }
    const balances = await ethMinted(...args);
    return balances;
} as any

export default adapter;


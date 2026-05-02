const address = "0x61D450a098b6a7f69fC4b98CE68198fe59768651"
const chainContracts = {
    ethereum: {
        issued: [address],
    },
    bsc: {
        issued: [address],
    },
    base: {
        issued: [address],
    },
    xdai: {
        issued: [address],
    },
    polygon: {
        issued: [address],
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedCLP' });
export default adapter;

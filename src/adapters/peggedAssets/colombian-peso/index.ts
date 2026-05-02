const address = "0x8a1D45e102e886510e891d2Ec656a708991e2D76"
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
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedCOP' });
export default adapter;

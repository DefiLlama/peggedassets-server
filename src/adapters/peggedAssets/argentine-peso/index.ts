const address = "0x0dc4f92879b7670e5f4e4e6e3c801d229129d90d"
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
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedARS' });
export default adapter;

const address = "0x337e7456b420bd3481e7fa61fa9850343d610d34"
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
    wc: {
        issued: [address],
    }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedMXN' });
export default adapter;

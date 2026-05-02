const address = "0xD76f5Faf6888e24D9F04Bf92a0c8B921FE4390e0"
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
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedREAL' });
export default adapter;

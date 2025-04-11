const chainContracts = {
    ethereum: {
        issued: ["0x57ab1e0003f623289cd798b1824be09a793e4bec"],
    },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
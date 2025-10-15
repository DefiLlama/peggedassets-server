import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    mezo: {
        issued: ["0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186"],
    },
    ethereum: {
        bridgedFromMezo: ["0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186"],
    },
};

const adapter = addChainExports(chainContracts);
export default adapter;
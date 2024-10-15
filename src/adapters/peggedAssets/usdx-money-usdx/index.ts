const chainContracts = {
    ethereum: {
        issued: ["0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef"],
    },
    bsc: {
        issued: ["0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef"],
    },
    arbitrum: {
        issued: ["0xf3527ef8dE265eAa3716FB312c12847bFBA66Cef"],
    },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
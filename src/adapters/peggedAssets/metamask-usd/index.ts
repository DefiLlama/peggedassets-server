const chainContracts = {
    ethereum: {
        issued: ["0xaca92e438df0b2401ff60da7e4337b687a2435da"]
    },
    linea: {
        issued: ["0xaca92e438df0b2401ff60da7e4337b687a2435da"]
    }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
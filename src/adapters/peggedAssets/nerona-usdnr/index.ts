const chainContracts = {
    ethereum: {
        issued: ["0xD48e565561416dE59DA1050ED70b8d75e8eF28f9"]
    },
    fluent: {
        issued: ["0xD48e565561416dE59DA1050ED70b8d75e8eF28f9"]
    }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

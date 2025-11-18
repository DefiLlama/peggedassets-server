const chainContracts = {
    ethereum: {
        issued: ["0xab5eb14c09d416f0ac63661e57edb7aecdb9befa"]
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
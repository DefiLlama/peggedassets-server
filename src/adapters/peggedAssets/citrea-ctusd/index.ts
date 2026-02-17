const chainContracts = {
    citrea: {
        issued: ["0x8D82c4E3c936C7B5724A382a9c5a4E6Eb7aB6d5D"]
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

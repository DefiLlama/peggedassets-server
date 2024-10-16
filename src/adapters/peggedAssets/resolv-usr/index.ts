const chainContracts = {
    ethereum: {
        issued: ["0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110"],
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
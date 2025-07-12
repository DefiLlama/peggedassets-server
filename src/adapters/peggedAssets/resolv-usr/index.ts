const chainContracts = {
    ethereum: {
        issued: ["0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110"],
    },
    base: {
        issued: ["0x35e5db674d8e93a03d814fa0ada70731efe8a4b9"],
    },
    bsc: {
        issued: ["0x2492d0006411af6c8bbb1c8afc1b0197350a79e9"],
    }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
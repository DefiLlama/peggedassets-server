const chainContracts = {
    ethereum: {
        issued: ["0xe343167631d89B6Ffc58B88d6b7fB0228795491D"]
    },
    solana: {
        issued: ["2u1tszSeqZ3qBWF3uNGPFc8TzMk2tdiwknnRMWGWjGWH"]
    },
    ink: {
        bridgedFromETH: ["0xe343167631d89B6Ffc58B88d6b7fB0228795491D"]
    },
    xlayer: {
        issued: ['0x4ae46a509f6b1d9056937ba4500cb143933d2dc8']
    }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 6});
export default adapter;
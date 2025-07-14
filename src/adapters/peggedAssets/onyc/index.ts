const chainContracts = {
    solana: {
        issued: ["5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5"]
    }
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 9});
export default adapter;
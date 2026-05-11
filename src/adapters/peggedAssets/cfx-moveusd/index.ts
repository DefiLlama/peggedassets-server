const chainContracts = {
    solana: {
        issued: ["3AdhVEX6k85yNivHVXDEiY3WyP2WgFQTUZCahGaeC2qm"]
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 6});
export default adapter;
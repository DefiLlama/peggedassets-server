const chainContracts = {
    solana: {
        issued: ["Ex5DaKYMCN6QWFA4n67TmMwsH8MJV68RX6YXTmVM532C"],
    },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { decimals: 9 });
export default adapter;
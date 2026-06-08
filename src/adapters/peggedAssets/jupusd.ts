
const chainContracts = {
    solana: {
        issued: ["JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD"]
    },
};

import { addChainExports } from "./helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

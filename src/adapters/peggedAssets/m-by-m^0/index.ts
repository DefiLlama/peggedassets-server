import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
        issued: ["0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"],
    },
};

const adapter = addChainExports(chainContracts);
export default adapter;
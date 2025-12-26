const chainContracts = {
    ethereum: {
        issued: ["0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6"],
    },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
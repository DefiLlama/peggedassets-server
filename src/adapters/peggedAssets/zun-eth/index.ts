const chainContracts = {
  ethereum: {
    issued: ["0xc2e660C62F72c2ad35AcE6DB78a616215E2F2222"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts, undefined, { pegType: 'peggedVAR' });
export default adapter;

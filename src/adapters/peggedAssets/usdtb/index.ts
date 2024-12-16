const chainContracts = {
  ethereum: {
    issued: "0xC139190F447e929f090Edeb554D95AbB8b18aC1C",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
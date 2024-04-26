const chainContracts = {
  ethereum: {
    issued: ["0x3c20ac688410be8f391be1fb00afc5c212972f86"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
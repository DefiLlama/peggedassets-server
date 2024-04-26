const chainContracts = {
  ethereum: {
    issued: "0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

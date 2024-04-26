const chainContracts = {
  iotex: {
    issued: ["0x6C0bf4b53696b5434A0D21C7D13Aa3cbF754913E"],
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
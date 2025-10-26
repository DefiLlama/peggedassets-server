import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x09fd37d9aa613789c517e76df1c53aece2b60df4"],
  },
  plasma: {
    issued: ["0xef7b1a03e0897c33b63159e38d779e3970c0e2fc"],
  },
};

const adapter = addChainExports(chainContracts);
export default adapter;

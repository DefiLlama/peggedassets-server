const chainContracts = {
    ethereum: {
        issued: ["0x2c537e5624e4af88a7ae4060c022609376c8d0eb"],
    },
    base: {
        issued: ["0xfb8718a69aed7726afb3f04d2bd4bfde1bdcb294"],
    },
    avax: {
        issued: ["0x564a341df6c126f90cf3ecb92120fd7190acb401"],
    },
    bsc: {
        issued: ["0xc1fdbed7dac39cae2ccc0748f7a80dc446f6a594"],
    },
    polygon: {
        issued: ["0x4fb71290ac171e1d144f7221d882becac7196eb5"],
    }
  };
  
import { isSea } from "node:sea";
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
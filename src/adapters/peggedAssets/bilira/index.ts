const pegType = "peggedTRY";

const chainContracts = {
    ethereum: {
        issued: ["0x2c537e5624e4af88a7ae4060c022609376c8d0eb"], 
        unreleased: ["0xd03846601b6b77965693741aAF296491Bc10A0EB"], 
        pegType
    },
    base: {
        issued: ["0xfb8718a69aed7726afb3f04d2bd4bfde1bdcb294"], pegType
    },
    avax: {
        issued: ["0x564a341df6c126f90cf3ecb92120fd7190acb401"], pegType
    },
    bsc: {
        issued: ["0xc1fdbed7dac39cae2ccc0748f7a80dc446f6a594"], pegType
    },
    polygon: {
        issued: ["0x4fb71290ac171e1d144f7221d882becac7196eb5"], pegType
    },
    solana: {
        issued: ["A94X2fRy3wydNShU4dRaDyap2UuoeWJGWyATtyp61WZf"], pegType
    },
    plasma: {
        issued: ["0x90729a45948c3078890Bc80F2a4e7870A2Ea4C5E"], pegType
    }
  };
  
import { isSea } from "node:sea";
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, { pegType });
  export default adapter;

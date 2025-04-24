const chainContracts = {
    ethereum: {
      issued: ["0x677ddbd918637E5F2c79e164D402454dE7dA8619"],
    },
    base: {
      bridgedFromETH: ["0x0937876EFd6C4101Be68cd89ba58D5Ecf0d53A64"],
    },
    hemi: {
        bridgedFromETH: ["0x7A06C4AeF988e7925575C50261297a946aD204A8"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
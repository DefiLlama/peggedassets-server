const chainContracts = {
    ethereum: {
      issued: ["0xa469b7ee9ee773642b3e93e842e5d9b5baa10067"],
    },
    base: {
      issued: ["0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938"],
    },
    blast: {
      issued: ["0x52056ed29fe015f4ba2e3b079d10c0b87f46e8c6"],
    },
    manta: {
      issued: ["0x73d23f3778a90be8846e172354a115543df2a7e4"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
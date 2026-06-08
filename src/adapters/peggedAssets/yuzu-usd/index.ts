const chainContracts = {
    plasma: {
      issued: ["0x6695c0f8706c5ace3bdf8995073179cca47926dc"],
    },
    monad: {
      bridgedFromPlasma: ["0x9dcB0D17eDDE04D27F387c89fECb78654C373858"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
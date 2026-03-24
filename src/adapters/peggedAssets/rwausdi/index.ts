const chainContracts = {
    ethereum: {
      issued: ["0xa39986f96b80d04e8d7aeaaf47175f47c23fd0f4"],
    },
    monad: {
      issued: ["0x650b616b46fF94000Eb115926aB8393B90788D76"],
    },
    base: {
      issued: ["0xd74FB32112b1eF5b4C428Fead8dA8d85A0019009"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
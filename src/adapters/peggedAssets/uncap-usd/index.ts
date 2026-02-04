const chainContracts = {
    starknet: {
      issued: ["0x2F94539F80158f9a48a7acF3747718dfBec9B6f639E2742c1FB44aE7ab5AA04"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
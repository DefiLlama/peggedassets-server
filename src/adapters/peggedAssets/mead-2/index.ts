
const chainContracts = {
    berachain: {
      issued: ["0xedb5180661f56077292c92ab40b1ac57a279a396"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
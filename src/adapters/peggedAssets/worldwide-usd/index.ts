const chainContracts = {
    ethereum: {
      issued: ["0x7Cd017ca5ddb86861FA983a34b5F495C6F898c41"],
      unreleased: ["0xf3380D451a0cc1990A1DC7b3A97590F4e5a9a6C9"]
    },
    polygon: {
      issued: ["0x7Cd017ca5ddb86861FA983a34b5F495C6F898c41"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
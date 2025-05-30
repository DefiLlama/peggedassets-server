const chainContracts = {
    avax: {
      issued: ["0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
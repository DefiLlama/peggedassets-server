const chainContracts = {
    avax: {
      issued: ["0x24dE8771bC5DdB3362Db529Fc3358F2df3A0E346"],
    },
    monad: {
      bridgedFromAvax: ["0x0D9D741FE423Cd5419e4BCb6cB2FfA87AFa93bA4"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
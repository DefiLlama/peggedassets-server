const chainContracts = {
    ethereum: {
      issued: ["0x09fD37d9AA613789c517e76DF1c53aEce2b60Df4"],
    },
    plasma: {
      issued: ["0xef7b1a03e0897c33b63159e38d779e3970c0e2fc"],
    },
  };
  
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
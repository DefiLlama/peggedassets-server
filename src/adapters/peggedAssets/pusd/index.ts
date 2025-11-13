const chainContracts = {
    ethereum: {
      issued: ["0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78"],
    },
    binance: {
        issued: ["0xFAF0cEe6B20e2Aaa4B80748a6AF4CD89609a3d78"],
    },
    tron: {
        issued: ["TF39FD5YwW63mtB1zr9gpVdyFUx1icac2y"]
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
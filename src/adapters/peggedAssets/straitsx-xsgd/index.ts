const pegType = "peggedSGD";

const chainContracts =  {
    ethereum: {
      issued: ["0x70e8de73ce538da2beed35d14187f6959a8eca96"], pegType,
    },
    polygon: {
        issued: ["0xdc3326e71d45186f113a2f448984ca0e8d201995"], pegType,
      },
    avax: {
        issued: ["0xb2f85b7ab3c2b6f62df06de6ae7d09c010a5096e"], pegType,
      },
    arbitrum: {
        issued: ["0xE333e7754a2DC1E020a162Ecab019254b9DaB653"], pegType,
      },
  }
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
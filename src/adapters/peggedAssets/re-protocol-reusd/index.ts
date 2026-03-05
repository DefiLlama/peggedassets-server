const chainContracts = {
    ethereum: {
      issued: ["0x5086bf358635b81d8c47c66d1c8b9e567db70c72"],
    },
    arbitrum: {
      issued: ["0x76ce01f0ef25aa66cc5f1e546a005e4a63b25609"],
    },
    base: {
      issued: ["0x7d214438d0f27afccc23b3d1e1a53906ace5cfea"],
    },
    avax: {
      issued: ["0x180af87b47bf272b2df59dccf2d76a6eafa625bf"],
    },
    ink: {
      issued: ["0x5bcf6b008bf80b9296238546bace1797657b05d6"],
    },
    bsc: {
      issued: ["0xba9425ec55ee0e72216d18e0ad8bbba2553bfb60"],
    }
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
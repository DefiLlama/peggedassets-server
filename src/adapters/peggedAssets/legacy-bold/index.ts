import { addChainExports } from "../helper/getSupply";

const chainContracts = {
    ethereum: {
        issued: ["0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98"],
    },
    base: {
        bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
      },
      arbitrum: {
        bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
      },
      optimism: {
        bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
      },
      scroll: {
        bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
      },
      avax: {
        bridgedFromETH: ["0x087c440f251ff6cfe62b86dde1be558b95b4bb9b"],
      },
};

const adapter = addChainExports(chainContracts);
export default adapter;
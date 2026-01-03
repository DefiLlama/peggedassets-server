const chainContracts = {
  ethereum: {
    issued: ["0x8E870D67F660D95d5be530380D0eC0bd388289E1"],
  },
  bsc: {
    bridgedFromETH: ["0xb3c11196A4f3b1da7c23d9FB0A3dDE9c6340934F"],
  },
  linea: {
    bridgedFromETH: ["0xd2bc272EA0154A93bf00191c8a1DB23E67643EC5"],
  },
  solana: {
    issued: ["HVbpJAQGNpkgBaYBZQBR1t7yFdvaYVp2vCQQfKKEN4tM"],
  },
};
import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

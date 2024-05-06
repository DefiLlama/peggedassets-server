const chainContracts = {
  ethereum: {
    issued: ["0xA40640458FBc27b6EefEdeA1E9C9E17d4ceE7a21"],
    pegType: 'peggedEUR',
  },
  bsc: {
    issued: ["0xA40640458FBc27b6EefEdeA1E9C9E17d4ceE7a21"],
    pegType: 'peggedEUR',
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

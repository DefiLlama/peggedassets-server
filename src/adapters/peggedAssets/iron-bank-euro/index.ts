
const chainContracts = {
  ethereum: {
    issued: ["0x96E61422b6A9bA0e068B6c5ADd4fFaBC6a4aae27"], pegType: 'peggedEUR',
    reserves: ["0x0D5Dc686d0a2ABBfDaFDFb4D0533E886517d4E83"], // multisig
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
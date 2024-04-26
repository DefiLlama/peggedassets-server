const chainContracts = {
  ethereum: {
    issued: ["0x735fa792e731a2e8F83F32eb539841b7B72e6d8f"],
    pegType: 'peggedEUR',
  },
  polygon: {
    issued: ["0x735fa792e731a2e8F83F32eb539841b7B72e6d8f"],
    pegType: 'peggedEUR',
  },
  bsc: {
    issued: ["0x735fa792e731a2e8F83F32eb539841b7B72e6d8f"],
    pegType: 'peggedEUR',
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
const chainContracts = {
  ethereum: {
    issued: ["0xace8e719899f6e91831b18ae746c9a965c2119f1"],
  },
  bsc: {
    issued: ["0x1f8955e640cbd9abc3c3bb408c9e2e1f5f20dfe6"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

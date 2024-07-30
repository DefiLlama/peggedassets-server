const chainContracts = {
  ethereum: {
    issued: ["0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4"],
  },
  optimism: {
    issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
  arbitrum: {
    issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
  era: {
    issued: ["0x5FC44E95eaa48F9eB84Be17bd3aC66B6A82Af709"],
  },
  polygon_zkevm: {
    issued: ["0xCA68ad4EE5c96871EC6C6dac2F714a8437A3Fe66"],
  },
  mantle: {
    issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
  linea: {
    issued: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
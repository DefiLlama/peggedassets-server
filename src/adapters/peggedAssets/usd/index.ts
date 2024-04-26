const chainContracts = {
  polygon: {
    issued: ["0x236eec6359fb44cce8f97e99387aa7f8cd5cde1f"],
  },
  bsc: {
    issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
  },
  arbitrum: {
    issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
  },
  optimism: {
    issued: ["0x73cb180bf0521828d8849bc8CF2B920918e23032"],
  },
  era: {
    issued: ["0x8E86e46278518EFc1C5CEd245cBA2C7e3ef11557"],
  },
  avax: {
    issued: ["0xe80772Eaf6e2E18B651F160Bc9158b2A5caFCA65"],
  },
  linea: {
    issued: ["0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376"],
  },
  base: {
    issued: ["0xB79DD08EA68A908A97220C76d19A6aA9cBDE4376"],
  },
  blast: {
    issued: [
      "0x4fEE793d435c6D2c10C135983BB9d6D4fC7B9BBd",
      "0x870a8F46b62B8BDeda4c02530C1750CddF2ED32e",
    ],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;

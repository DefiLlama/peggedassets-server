process.env.MANTRA_RPC = process.env.MANTRA_RPC || 'https://evm.mantrachain.io';

const chainContracts = {
  mantra: {
    issued: ["0xd2b95283011E47257917770D28Bb3EE44c849f6F"],
  },
};

import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
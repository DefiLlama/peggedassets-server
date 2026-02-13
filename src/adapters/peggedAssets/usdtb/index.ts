const chainContracts = {
  ethereum: {
    issued: "0xC139190F447e929f090Edeb554D95AbB8b18aC1C",
  },
  solana: {
    issued: "8yXrtJ54jZtE84xEBzTESKuegjcAkAuDrdAhRd8i8n3T",
  },
};


import { addChainExports } from "../helper/getSupply";
const adapter = addChainExports(chainContracts);
export default adapter;
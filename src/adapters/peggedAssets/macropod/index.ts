const chainContracts: ChainContracts = {
  rbn: {
    issued: ["0x081599E4936D12c46Bd48913B2329115Cd26cbdd"],
  },
  ethereum: {
    issued: ["0x081599E4936D12c46Bd48913B2329115Cd26cbdd"],
  },
  solana: {
    issued: ["CiYXBwHPrdNkMtxR8YEWKv78K6bQjFoEWhPQrZqEmubi"],
  },
  base: {
    issued: ["0xeded6ae915b129b67a4ad49901518f2736427063"],
  },
};
import { addChainExports } from "../helper/getSupply";
import { ChainContracts } from "../peggedAsset.type";
const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedAUD" });
export default adapter;
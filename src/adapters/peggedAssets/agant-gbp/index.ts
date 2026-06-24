import { addChainExports } from "../helper/getSupply";
import type { ChainContracts } from "../peggedAsset.type";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xbBe6aAB0Ed76e90AeA0d1cd978EC231c8AdCDF8b"],
  },
  base: {
    issued: ["0xbBe6aAB0Ed76e90AeA0d1cd978EC231c8AdCDF8b"],
  },
  solana: {
    issued: ["DYoCmA91VE8REbWNw3kM736PN7vv97qc2jr5wmUbuNtZ"],
  },
  tempo: {
    issued: ["0x20C0000000000000000000000a6Da882d075a4C3"],
  },
};

const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedGBP" });
export default adapter;

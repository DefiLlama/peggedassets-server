import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter } from "../peggedAsset.type";

const chainContracts = {
  ethereum: {
    issued: ["0x48f9e38f3070AD8945DFEae3FA70987722E3D89c"],
  },
  tempo: {
    issued: ["0x20c000000000000000000000ab02d39df30bd17e"], // iUSD on Tempo Mainnet (Stargate Hydra OFT, decimals=6)
  },
};

// iUSD is a standard ERC20 with 18 decimals
const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts, {}, { decimals: 18 });

export default adapter;

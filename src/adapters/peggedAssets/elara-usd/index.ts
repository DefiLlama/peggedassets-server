import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x65Fb0f9b196d524De0C4F3BAF572F0a79eb21194"],
  },
};

const adapter = addChainExports(chainContracts);
export default adapter;

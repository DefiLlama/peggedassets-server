import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x7c1156e515aa1a2e851674120074968c905aaf37"],
  },
};

const adapter = addChainExports(chainContracts);
export default adapter;

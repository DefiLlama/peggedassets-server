import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x87622385F960fcCB3121d6D0A9513bd1D9Bed6cA"],
  },
};

const adapter = addChainExports(chainContracts, undefined, {
  pegType: "peggedHKD",
});

export default adapter;
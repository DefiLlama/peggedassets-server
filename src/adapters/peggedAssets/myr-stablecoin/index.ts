import { addChainExports } from "../helper/getSupply";

const chainContracts = {
  ethereum: {
    issued: ["0x3Fc98a885E99420d0ce43Bcb81bF21A4e3F45E5f"],
  },
};

export default addChainExports(chainContracts, undefined, {
  pegType: "peggedMYR",
  decimals: 6,
});

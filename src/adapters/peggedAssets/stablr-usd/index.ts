const chainContracts = {
    ethereum: {
      issued: ["0x7B43E3875440B44613DC3bC08E7763e6Da63C8f8"],
    },
  };
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, {pegType: "peggedUSD"});
  export default adapter;
  
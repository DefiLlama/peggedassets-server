const chainContracts = {
    base: {
      issued: ["0x1f94d6A61973eDf53252b9E61c6250F303957b9D"],
    },
  };
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
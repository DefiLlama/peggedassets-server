const chainContracts = {
    ethereum: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
    },
    bsc: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
    },
    base: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
    },
    polygon: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
    },
    avax: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
    },
    solana: {
      issued: ["2zMqyX4AYCk6mgy5UZ2S7zUaLxwERhK5WjqDzkPPbSpW"],
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts, undefined, { pegType: "peggedGBP" });
  export default adapter;
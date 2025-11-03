const chainContracts = {
    ethereum: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
      pegType: 'peggedGBP',
    },
    bsc: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
      pegType: 'peggedGBP',
    },
    base: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
      pegType: 'peggedGBP',
    },
    polygon: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
      pegType: 'peggedGBP',
    },
    avax: {
      issued: ["0x27f6c8289550fCE67f6B50BeD1F519966aFE5287"],
      pegType: 'peggedGBP',
    },
    solana: {
      issued: ["2zMqyX4AYCk6mgy5UZ2S7zUaLxwERhK5WjqDzkPPbSpW"],
      pegType: 'peggedGBP',
    },
  };
  
  import { addChainExports } from "../helper/getSupply";
  const adapter = addChainExports(chainContracts);
  export default adapter;
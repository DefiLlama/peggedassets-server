import { sumSingleBalance } from "../helper/generalUtil";
import { PeggedIssuanceAdapter, Balances, ChainBlocks, ChainContracts } from "../peggedAsset.type";
import axios from "axios";

const USDhContract = 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1';
const API_URL = 'https://api.mainnet.hiro.so/v2/contracts/call-read';

const chainContracts: ChainContracts = {
  stacks: {
    issued: [
      USDhContract,
    ],
  },
};

function parseClarityInt(hexString: string): string {
  const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  const numberHex = hex.slice(4);
  let bigIntValue = BigInt("0x" + numberHex);

  if (bigIntValue > BigInt("0x7ffffffffffffffffffffffffffffffff")) {
    bigIntValue = bigIntValue - BigInt("0x100000000000000000000000000000000");
  }

  return bigIntValue.toString();
}

async function fetchWithRetry(url: string, data: any, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await axios.post(url, data);
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
}

async function hermeticaMinted(decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    const balances = {} as Balances;
    const [contractAddress, contractName] = USDhContract.split('.');

    const res = await fetchWithRetry(`${API_URL}/${contractAddress}/${contractName}/get-total-supply`, {
      sender: contractAddress,
      arguments: [],
    });

    const result = res?.data?.result;
    if (result) {
      const supply = Number(parseClarityInt(result)) / 10 ** decimals;
      sumSingleBalance(balances, "peggedUSD", supply, "issued", false);
    }

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  stacks: {
    minted: hermeticaMinted(8), 
  },
};

export default adapter;
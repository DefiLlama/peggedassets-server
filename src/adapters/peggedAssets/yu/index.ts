import { ChainApi } from "@defillama/sdk";
import { sumSingleBalance } from "../helper/generalUtil";
import { solanaMintedOrBridged } from "../helper/getSupply";
import {
  Balances,
  ChainContracts,
  PeggedAssetType,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const pegType = "peggedUSD" as PeggedAssetType;

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0xE868084cf08F3c3db11f4B73a95473762d9463f7"],
  },
  solana: {
    bridgedFromETH: ["YUYAiJo8KVbnc6Fb6h3MnH2VGND4uGWDH4iLnw7DLEu"],
  },
};

const mintedInEthereum = async (api: ChainApi) => {
  const issued = chainContracts.ethereum.issued;
  const balances = {} as Balances;

  const supplies = await api.multiCall({
    abi: "erc20:totalSupply",
    calls: issued,
  });
  const decimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: issued,
  });
  issued.forEach((_address, i) => {
    sumSingleBalance(
      balances,
      pegType,
      supplies[i] / 10 ** decimals[i],
      "issued",
      false
    );
  });
  return balances;
};

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: mintedInEthereum,
  },
  solana: {
    ethereum: solanaMintedOrBridged(
      chainContracts.solana.bridgedFromETH,
      pegType
    ),
  },
};
export default adapter;

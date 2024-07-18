import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,  ChainContracts,
} from "../peggedAsset.type";
import { getTotalSupply as stellarGetTotalSupply } from "../helper/stellar";

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
  polygon: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
  optimism: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
  celo: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
  arbitrum: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
  base: {
    issued: ["0x4F604735c1cF31399C6E711D5962b2B3E0225AD3"],
  },
}

async function stellarMinted(assetID: string) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await stellarGetTotalSupply(assetID);
    sumSingleBalance(balances, "peggedUSD", totalSupply, "issued", false);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  stellar: {
    minted: stellarMinted("USDGLO:GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV"),
  },
};

export default adapter;

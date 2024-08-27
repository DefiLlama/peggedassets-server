import { sumSingleBalance } from "../helper/generalUtil";
import { call } from "../helper/starknet";
import {
  Balances,
  ChainBlocks,
  PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { starknetTotalSupplyAbi } from "./abi";

const chainContracts = {
  starknet: {
    issued: "0x0498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada",
  },
};

async function starknetMinted(chain: string, decimals: number) {
return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const totalSupply = await call(
      {
        target: chainContracts.starknet.issued,
        abi: starknetTotalSupplyAbi,
        params: [],
      },
      _chainBlocks?.[chain]
    );

    sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false,
    );

    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  starknet: {
    minted: starknetMinted("starknet", 18),
  },
};

export default adapter;

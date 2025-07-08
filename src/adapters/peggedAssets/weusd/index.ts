import { addChainExports } from "../helper/getSupply";
import { PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";
import { function_view } from "../helper/aptos";

const WEUSD_MODULE_ADDRESS = "0xed805e77c40d7e6ac5cd3e67514c485176621a2aa21e860cd515121d44a2f83d";

async function movementSupply(): Promise<Balances> {
  const balances = {} as Balances;
  
  const resp = await function_view({
    functionStr: `${WEUSD_MODULE_ADDRESS}::weusd::total_supply`,
    type_arguments: [],
    args: [],
  });
  
  balances["peggedUSD"] = Number(resp) / 1e6;
  
  return balances;
}

const chainContracts = {
  base: {
    issued: "0xdd73EA766B80417C0607A3f08E34A0C415D89D56",
  },
  arbitrum: {
    issued: "0xdd73EA766B80417C0607A3f08E34A0C415D89D56",
  },
  bsc: {
    issued: "0xdd73EA766B80417C0607A3f08E34A0C415D89D56",
  },
  plume: {
    issued: "0xdd73EA766B80417C0607A3f08E34A0C415D89D56",
  },
  hashkey: {
    issued: "0xdd73EA766B80417C0607A3f08E34A0C415D89D56",
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  move: {
    minted: movementSupply,
  }
};

export default adapter; 

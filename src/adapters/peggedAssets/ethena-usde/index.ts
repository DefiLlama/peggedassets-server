import type { ChainApi } from "@defillama/sdk";
import {
  addChainExports,
  getApi,
  solanaMintedOrBridged,
  tonTokenSupply,
} from "../helper/getSupply";
import { function_view } from "../helper/aptos";
import { sumSingleBalance } from "../helper/generalUtil";
import type { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";
import layerzeroConfig from "./layerzeroConfig";

const PREMINT_WALLET = "0xD7fCaDe52aFb60FbF0E1E5F72A683F43820f56A0";

function chainUnreleased(chain: string, token: string, decimals: number) {
  return async function (_api: ChainApi): Promise<Balances> {
    const api = await getApi(chain, _api);
    const balances = {} as Balances;
    const balance = await api.call({
      abi: "erc20:balanceOf",
      target: token,
      params: PREMINT_WALLET,
    });

    sumSingleBalance(balances, "peggedUSD", Number(balance) / 10 ** decimals);
    return balances;
  };
}

 async function moveSupply(): Promise<Balances> {
   const balances = {} as Balances;
   
   const resp = await function_view({
     functionStr: '0x1::fungible_asset::supply',
     type_arguments: ['0x1::object::ObjectCore'],
     args: [chainContracts.move.issued[0]],
   });
   balances["peggedUSD"] = Number(resp.vec[0]) / 1e6;
 
   return balances;
 }

const chainContracts = {
  ethereum: {
    issued: ["0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"],
  },
  move: {
    issued: ["0x9d146a4c9472a7e7b0dbc72da0eafb02b54173a956ef22a9fba29756f8661c6c"],
  },
  tempo: {
    issued: ["0x20c0000000000000000000002f52d5cc21a3207b"], // USDe on Tempo Mainnet (Stargate Hydra OFT, decimals=6)
  },
};

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
 
  solana: {
    ethereum: solanaMintedOrBridged(["DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT"]),
  },
  move: {
    minted: moveSupply,
  },
  ton: {
    ethereum: tonTokenSupply("EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f"),
  },
};

// Tokens held here facilitate primary L2 distribution and are not circulating
// until external parties receive them in exchange for additional backing.
for (const { chain, address, decimals } of [
  {
    chain: "ethereum",
    address: chainContracts.ethereum.issued[0],
    decimals: 18,
  },
  ...layerzeroConfig.tokens,
]) {
  adapter[chain] ??= {};
  adapter[chain].unreleased = chainUnreleased(chain, address, decimals);
}

export default adapter; 

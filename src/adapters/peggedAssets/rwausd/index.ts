import { addChainExports, getApi } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import { PeggedIssuanceAdapter, Balances } from "../peggedAsset.type";
import { ChainApi } from "@defillama/sdk";

const VAT = "0xbC22e8C15bC476EF4FD0124c5A03b23607e30D2C";
const BASE_TOKEN = "0x272Ec977f4575df41cD47b1b254954E1C7972789";
const INK_TOKEN = "0x2A66Bb2dA3AD1c854E79307F64b862DECD860D4c";

// base/ink are CCIP burn-and-mint, kept as plain issued totalSupply (confirmed against upstream's own peggedData.ts comment)
const chainContracts = {
  ink: { issued: [INK_TOKEN] },
  base: { issued: [BASE_TOKEN] },
};

// Vat.debt (RAD, /1e45) includes accrued yield not yet minted as ERC-20 on Ethereum, so raw totalSupply() undercounts
async function minted(api: ChainApi) {
  const balances = {} as Balances;
  const debt = await api.call({ abi: "uint256:debt", target: VAT });
  const baseApi = await getApi("base", api);
  const inkApi = await getApi("ink", api);
  const baseSupply = await baseApi.call({ abi: "erc20:totalSupply", target: BASE_TOKEN });
  const inkSupply = await inkApi.call({ abi: "erc20:totalSupply", target: INK_TOKEN });
  const ethereumSupply = Number(debt) / 1e45 - Number(baseSupply) / 1e18 - Number(inkSupply) / 1e18;
  sumSingleBalance(balances, "peggedUSD", ethereumSupply, "issued", false);
  return balances;
}

const adapter: PeggedIssuanceAdapter = {
  ...addChainExports(chainContracts),
  ethereum: {
    minted,
  },
};

export default adapter;

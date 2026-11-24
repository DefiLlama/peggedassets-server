// GHO (Aave). Circulating = ERC-20 supply minus pre-minted GHO that has not left the protocol.
//
// Every GHO is minted on Ethereum by a facilitator (sum of bucketLevels == totalSupply). Two
// facilitator types pre-mint GHO before anyone has posted collateral or exogenous assets for it:
//
// 1. GhoDirectFacilitator -> GhoReserve (aave-dao/gho-origin src/contracts/facilitators/gsm).
//    GHO is minted into a GhoReserve (on L2s: minted on Ethereum, bridged via CCIP, then funded
//    into the remote GhoReserve). GSMs draw from it with use() when a user sells USDC/USDT and
//    return it with restore() when a user buys the asset back, so the reserve balance is GHO no
//    user holds and no exogenous asset backs. Verified: balanceOf(reserve) + sum(getUsed(entity))
//    equals the amount funded into each reserve (ETH 310M, Arbitrum/Monad/Plasma 50M each).
//
// 2. GhoDirectMinter -> Aave v3 pool. The minter mints GHO and supplies it to an Aave market
//    (Core, Prime/Lido, Horizon); it only becomes collateral-backed when a borrower takes it out.
//    Pool liquidity also holds GHO supplied by ordinary users (already circulating GHO), so only
//    the part of the liquidity that exceeds every non-minter claim is counted as idle pre-mint:
//      idle = clamp(liquidity - (aTokenSupply + treasuryAccrued - minterATokenBalance), 0, bucketLevel)
//    i.e. borrows are attributed to the minter's liquidity first. This is the smallest idle amount
//    consistent with onchain state, so GHO users deposited is never removed from circulation.
//
// Bridged supply: L2 GHO is only minted by the CCIP BurnMint pools (the sole facilitator on each
// L2 token), so L2 totalSupply is bridged from Ethereum and the framework subtracts it from the
// Ethereum figure. L2 reserve inventory is excluded on the L2 where it sits, never on Ethereum, so
// nothing is subtracted twice.
import { ChainApi } from "@defillama/sdk";
import { addChainExports } from "../helper/getSupply";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, PeggedIssuanceAdapter } from "../peggedAsset.type";

const GHO = "0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f";
const ZERO = BigInt(0);
const RAY = BigInt(10) ** BigInt(27);
const DECIMALS = 18;

const chainContracts = {
  ethereum: { issued: [GHO] },
  monad: { bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"], bridge: "ccip" },
  arbitrum: { bridgedFromETH: ["0x7dfF72693f6A4149b17e7C6314655f6A9F7c8B33"], bridge: "ccip" },
  base: { bridgedFromETH: ["0x6Bb7a212910682DCFdbd5BCBb3e28FB4E8da10Ee"], bridge: "ccip" },
  avax: { bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"], bridge: "ccip" },
  xdai: { bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"], bridge: "ccip" },
  ink: { bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"], bridge: "ccip" },
  mantle: { bridgedFromETH: ["0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73"], bridge: "ccip" },
  plasma: { bridgedFromETH: ["0xb77E872A68C62CfC0dFb02C067Ecc3DA23B4bbf3"], bridge: "ccip" },
  xlayer: { bridgedFromETH: ["0xDe6539018B095353A40753Dc54C91C68c9487D4E"], bridge: "ccip" },
};

// GhoReserve per chain (bgd-labs/aave-address-book Gho<Chain>.GHO_RESERVE).
// fundedFrom: timestamp of the block where the reserve first received GHO (balance 0 -> 50M); the
// balance is 0 before it by definition, and on some L2s the GHO token itself did not exist yet, so
// earlier timestamps skip the call. Ethereum needs no gate: the token always exists there.
const GHO_RESERVES: { [chain: string]: { token: string; reserve: string; fundedFrom?: number } } = {
  ethereum: { token: GHO, reserve: "0x54C58157DeF387A880AE62332D1445f03adbE7E9" },
  arbitrum: { token: chainContracts.arbitrum.bridgedFromETH[0], reserve: "0xC912D64F9F649897dC0244da3835869d410d053e", fundedFrom: 1784397603 }, // block 485226637
  monad: { token: chainContracts.monad.bridgedFromETH[0], reserve: "0x307707A53Cb51670a8bcC8a2808A349C65E1Fb92", fundedFrom: 1785960902 }, // block 93439819
  plasma: { token: chainContracts.plasma.bridgedFromETH[0], reserve: "0x6aC541605b0317dE076C9FeC2842902c844dEa74", fundedFrom: 1772636281 }, // block 15704523
};

// GhoDirectMinter facilitators on Ethereum. A minter's bucketLevel is 0 outside its lifetime, so
// pool state is only read while it has GHO outstanding.
const DIRECT_MINTERS = [
  "0x593B09afc075B3c326CE2AD7750888645BA8943d", // Core, first minter (blocks 22839362-23366917, replaced by the next one)
  "0x5513224daaEABCa31af5280727878d52097afA05", // Core (AaveV3Ethereum.GHO_DIRECT_MINTER)
  "0x2cE01c87Fec1b71A9041c52CaED46Fc5f4807285", // Prime / Lido (AaveV3EthereumLido.GHO_DIRECT_MINTER)
  "0xe10C78A3AC7f016eD2DE1A89c5479b1039EAB9eA", // Horizon (AaveV3EthereumHorizon.GHO_DIRECT_MINTER)
];

const abi = {
  getFacilitator: "function getFacilitator(address) view returns ((uint128 bucketCapacity, uint128 bucketLevel, string label))",
  getReserveData: "function getReserveData(address) view returns (((uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
  getVirtualUnderlyingBalance: "function getVirtualUnderlyingBalance(address) view returns (uint128)",
};

export type DirectMinterState = {
  bucketLevel: bigint; // GHO minted by the minter and not yet burned
  liquidity: bigint; // GHO the pool holds and can lend out (virtual underlying balance)
  aTokenSupply: bigint; // all supplier claims, minter included
  treasuryAccrued: bigint; // reserve factor accrued to the treasury, not yet minted as aTokens
  minterATokenBalance: bigint; // the minter's own claim
};

// Pre-minted GHO still sitting unborrowed in the pool: liquidity left after every non-minter
// claim is honoured, capped at what the minter actually minted.
export function idleDirectMinterGho(s: DirectMinterState): bigint {
  let otherClaims = s.aTokenSupply + s.treasuryAccrued - s.minterATokenBalance;
  if (otherClaims < ZERO) otherClaims = ZERO;
  const idle = s.liquidity - otherClaims;
  if (idle <= ZERO) return ZERO;
  return idle < s.bucketLevel ? idle : s.bucketLevel;
}

async function directMintersIdle(api: ChainApi): Promise<bigint> {
  const facilitators = await api.multiCall({ target: GHO, abi: abi.getFacilitator, calls: DIRECT_MINTERS });
  const active = DIRECT_MINTERS
    .map((minter, i) => ({ minter, bucketLevel: BigInt(facilitators[i].bucketLevel) }))
    .filter((m) => m.bucketLevel > ZERO);
  if (!active.length) return ZERO;

  const minters = active.map((m) => m.minter);
  const [pools, aTokens] = await Promise.all([
    api.multiCall({ abi: "address:POOL", calls: minters }),
    api.multiCall({ abi: "address:GHO_A_TOKEN", calls: minters }),
  ]);
  const [reserveData, liquidity, aTokenSupplies, minterBalances] = await Promise.all([
    api.multiCall({ abi: abi.getReserveData, calls: pools.map((pool: string) => ({ target: pool, params: [GHO] })) }),
    api.multiCall({ abi: abi.getVirtualUnderlyingBalance, calls: pools.map((pool: string) => ({ target: pool, params: [GHO] })) }),
    api.multiCall({ abi: "erc20:totalSupply", calls: aTokens }),
    api.multiCall({ abi: "erc20:balanceOf", calls: aTokens.map((aToken: string, i: number) => ({ target: aToken, params: [minters[i]] })) }),
  ]);

  let total = ZERO;
  active.forEach((m, i) => {
    if (reserveData[i].aTokenAddress.toLowerCase() !== aTokens[i].toLowerCase())
      throw new Error(`GHO direct minter ${m.minter}: GHO_A_TOKEN does not match the pool's GHO aToken`);
    total += idleDirectMinterGho({
      bucketLevel: m.bucketLevel,
      liquidity: BigInt(liquidity[i]),
      aTokenSupply: BigInt(aTokenSupplies[i]),
      treasuryAccrued: (BigInt(reserveData[i].accruedToTreasury) * BigInt(reserveData[i].liquidityIndex)) / RAY,
      minterATokenBalance: BigInt(minterBalances[i]),
    });
  });
  return total;
}

function unreleased(chain: string, includeDirectMinters: boolean) {
  const { token, reserve, fundedFrom } = GHO_RESERVES[chain];
  return async (api: ChainApi) => {
    if (fundedFrom && api.timestamp && api.timestamp < fundedFrom) return {};
    await api.getBlock(); // pin every call below to one block
    const [reserveBalance, minterIdle] = await Promise.all([
      api.call({ target: token, abi: "erc20:balanceOf", params: [reserve] }),
      includeDirectMinters ? directMintersIdle(api) : Promise.resolve(ZERO),
    ]);
    const balances = {} as Balances;
    const total = BigInt(reserveBalance) + minterIdle;
    sumSingleBalance(balances, "peggedUSD", Number(total) / 10 ** DECIMALS);
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = addChainExports(chainContracts, undefined, { pegType: "peggedUSD" });
for (const chain of Object.keys(GHO_RESERVES))
  adapter[chain].unreleased = unreleased(chain, chain === "ethereum");

export default adapter;

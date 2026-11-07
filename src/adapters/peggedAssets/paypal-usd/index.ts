import { addChainExports, getApi } from "../helper/getSupply";
import { getTotalSupply } from "../helper/cardano";
import { getTokenBalance as solanaGetTokenBalance } from "../helper/solana";
import { sumSingleBalance } from "../helper/generalUtil";
import { Balances, ChainBlocks, PeggedIssuanceAdapter } from "../peggedAsset.type";
import { ChainApi } from "@defillama/sdk";

const assetIDs = {
  cardano: {
    issued: [
      "25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff9355059555344",
    ],
  },
};

async function getCardanoSupply() {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    const supply = await getTotalSupply(assetIDs.cardano.issued[0]);
    sumSingleBalance(balances, "peggedUSD", supply, "wan", true);
    return balances;
  };
}

// PYUSD0 ERC20 addresses (same bytecode, different CREATE2 salts per batch of chains)
const PYUSD0_A = "0x99aF3EeA856556646C98c8B9b2548Fe815240750";
const PYUSD0_B = "0x142cdc44890978b506e745bb3bd11607b7f7faef";
const PYUSD0_C = "0xa0c9b923f4551f1ec1a49665943160b18704ce06";

// USD Flow (USDF, 0x2aaBea2058b5aC2D339b163C6Ab6f2b6d53aabED on Flow EVM) is a LayerZero NativeOFT minted
// against PYUSD locked in two lockboxes: the Ethereum OFT adapter 0xfa0e... (peered only with Flow) and
// the Solana OFT escrow owned by program 2KUb8.... Their balances sum to USDF's total supply, so Flow is
// credited with each lockbox balance and that amount is debited from the source chain.
const PYUSD_ETH = "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8";
const PYUSD_SOL = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo";
const USDF_LOCKBOX_ETH = "0xfa0e06b54986ad96de87a8c56fea76fbd8d493f8";
const USDF_ESCROW_OWNER_SOL = "2KUb8dcZR9LyrSg4RdkQx91xX6mPQLpS1MEo6gwfvLZk";

function usdfBridgedFromEthereum() {
  return async function (_api: ChainApi): Promise<Balances> {
    const api = await getApi("ethereum", _api);
    const balances = {} as Balances;
    const locked = await api.call({ abi: "erc20:balanceOf", target: PYUSD_ETH, params: USDF_LOCKBOX_ETH });
    sumSingleBalance(balances, "peggedUSD", locked / 1e6, "layerzero", false, "ethereum");
    return balances;
  };
}

function usdfBridgedFromSolana() {
  return async function (): Promise<Balances> {
    const balances = {} as Balances;
    const locked = await solanaGetTokenBalance(PYUSD_SOL, USDF_ESCROW_OWNER_SOL);
    sumSingleBalance(balances, "peggedUSD", locked, "layerzero", false, "solana");
    return balances;
  };
}

const chainContracts = {
  ethereum: {
    issued: ["0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"],
  },
  arbitrum: {
    issued: ["0x46850ad61c2b7d64d08c9c754f45254596696984"],
  },
  solana: {
    issued: ["2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo"],
  },
  // PYUSD0 (Everdawn OFT mesh): every deployment below is minted against PYUSD locked in the LayerZero
  // adapter 0x3cd2b89c49d130c08f1d683225b2e5deb63ff876 on ARBITRUM (its balance equals the sum of these
  // supplies), so they are debited from Arbitrum. LZ metadata pegs them to Ethereum, which is why they
  // are excluded from the generated layerzeroConfig via bridgeConfig.lzConfig.excludeChains.
  // Polygon PYUSD0 is backed elsewhere (not that lockbox) and stays in the generated config.
  flow: {
    bridgedFromArbitrum: [PYUSD0_A],
    bridge: "layerzero",
  },
  codex: {
    bridgedFromArbitrum: [PYUSD0_A],
    bridge: "layerzero",
  },
  fraxtal: {
    bridgedFromArbitrum: [PYUSD0_A],
    bridge: "layerzero",
  },
  stable: {
    issued: ["0x28F1f38a9F7dB1f769A71aF0a13E8BACe2ab0E9f"],
    bridgedFromArbitrum: [PYUSD0_A],
    bridge: "layerzero",
  },
  sei: {
    bridgedFromArbitrum: [PYUSD0_B],
    bridge: "layerzero",
  },
  abstract: {
    bridgedFromArbitrum: [PYUSD0_B],
    bridge: "layerzero",
  },
  avax: {
    bridgedFromArbitrum: [PYUSD0_B],
    bridge: "layerzero",
  },
  ink: {
    bridgedFromArbitrum: [PYUSD0_B],
    bridge: "layerzero",
  },
  plume_mainnet: {
    bridgedFromArbitrum: [PYUSD0_B],
    bridgedFromETH: ["0xe9e8330a71912f03e54e7d93795acd9a56f070aa"], // PayUSD NativeOFT, locked on Ethereum
    bridge: "layerzero",
  },
  kiteai: {
    bridgedFromArbitrum: [PYUSD0_C],
    bridge: "layerzero",
  },
  optimism: {
    bridgedFromArbitrum: [PYUSD0_C],
    bridge: "layerzero",
  },
  tron: {
    bridgedFromArbitrum: ["0x6b5eafbcaf0e06d1a12c35e211263e3e51af767a"],
    bridge: "layerzero",
  },
};

const chainExports = addChainExports(chainContracts, undefined, { decimals: 6 });

const adapter: PeggedIssuanceAdapter = {
  ...chainExports,
  flow: {
    ...chainExports.flow, // PYUSD0 from Arbitrum
    ethereum: usdfBridgedFromEthereum(), // USDF
    solana: usdfBridgedFromSolana(), // USDF
  },
  cardano: {
    ethereum: getCardanoSupply(),
  },
};

export default adapter;

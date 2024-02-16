const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import { bridgedSupply } from "../helper/getSupply";
import {
	Balances,
	ChainBlocks,
	PeggedIssuanceAdapter,
} from "../peggedAsset.type";

type ChainContracts = {
	[chain: string]: {
		[contract: string]: string[];
	};
};

const chainContracts: ChainContracts = {
	ethereum: {
		issued: ["0x15f74458aE0bFdAA1a96CA1aa779D715Cc1Eefe4"],
	},
	optimism: {
		bridgedFromETH: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
	},
	arbitrum: {
		bridgedFromETH: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
	},
	zksync: {
		bridgedFromETH: ["0x5FC44E95eaa48F9eB84Be17bd3aC66B6A82Af709"],
	},
	polygon_zkevm: {
		bridgedFromETH: ["0xCA68ad4EE5c96871EC6C6dac2F714a8437A3Fe66"],
	},
	linea: {
		bridgedFromETH: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
	},
	mantle: {
		bridgedFromETH: ["0x894134a25a5faC1c2C26F1d8fBf05111a3CB9487"],
	},
};

async function chainMinted(chain: string, decimals: number) {
	return async (
		_timestamp: number,
		_ethBlock: number,
		_chainBlocks: ChainBlocks,
	) => {
		const balances = {} as Balances;
		for (const issued of chainContracts[chain].issued) {
			const totalSupply = (
				await sdk.api.abi.call({
					abi: "erc20:totalSupply",
					target: issued,
					block: _chainBlocks?.[chain],
					chain: chain,
				})
			).output;
			sumSingleBalance(
				balances,
				"peggedUSD",
				totalSupply / 10 ** decimals,
				"issued",
				false,
			);
		}
		return balances;
	};
}

const adapter: PeggedIssuanceAdapter = {
	ethereum: {
		minted: chainMinted("ethereum", 18),
		unreleased: async () => ({}),
	},
	optimism: {
		minted: async () => ({}),
		unreleased: async () => ({}),
		ethereum: bridgedSupply(
			"optimism",
			18,
			chainContracts.optimism.bridgedFromETH,
		),
	},
	arbitrum: {
		minted: async () => ({}),
		unreleased: async () => ({}),
		ethereum: bridgedSupply(
			"arbitrum",
			18,
			chainContracts.arbitrum.bridgedFromETH,
		),
	},
	zksync: {
		minted: async () => ({}),
		unreleased: async () => ({}),
		ethereum: bridgedSupply("zksync", 18, chainContracts.era.bridgedFromETH),
	},
	polygon_zkevm: {
		minted: async () => ({}),
		unreleased: async () => ({}),
		ethereum: bridgedSupply(
			"polygon_zkevm",
			18,
			chainContracts.polygon_zkevm.bridgedFromETH,
		),
	},
  linea: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("linea", 18, chainContracts.linea.bridgedFromETH),
  },
  mantle: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply("mantle", 18, chainContracts.mantle.bridgedFromETH),
  },
};

export default adapter;

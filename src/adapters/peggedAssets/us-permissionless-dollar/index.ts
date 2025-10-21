const sdk = require("@defillama/sdk");
import {
    ChainBlocks,
    PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
        issued: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    base: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    arbitrum: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    optimism: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    polygon: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
    bsc: {
        bridgedFromETH: "0x476ef9ac6D8673E220d0E8BC0a810C2Dc6A2AA84",
    },
};

async function ethereumMinted() {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        const totalSupply = (
            await sdk.api.abi.call({
                abi: "erc20:totalSupply",
                target: chainContracts.ethereum.issued,
                block: _ethBlock,
                chain: "ethereum",
            })
        ).output;
        return { peggedUSD: totalSupply / 10 ** 18 };
    };
}

async function bridgedFromEthereum(chain: string, decimals: number, address: string) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        chainBlocks: ChainBlocks
    ) {
        const totalSupply = (
            await sdk.api.abi.call({
                abi: "erc20:totalSupply",
                target: address,
                block: chainBlocks[chain],
                chain: chain,
            })
        ).output;
        return { peggedUSD: totalSupply / 10 ** decimals };
    };
}

const adapter: PeggedIssuanceAdapter = {
    ethereum: {
        minted: ethereumMinted(),
    },
    bsc: {
        ethereum: bridgedFromEthereum("bsc", 18, chainContracts.bsc.bridgedFromETH),
    },
    polygon: {
        ethereum: bridgedFromEthereum("polygon", 18, chainContracts.polygon.bridgedFromETH),
    },
    base: {
        ethereum: bridgedFromEthereum("base", 18, chainContracts.base.bridgedFromETH),
    },
    arbitrum: {
        ethereum: bridgedFromEthereum("arbitrum", 18, chainContracts.arbitrum.bridgedFromETH),
    },
    optimism: {
        ethereum: bridgedFromEthereum("optimism", 18, chainContracts.optimism.bridgedFromETH),
    }
};

export default adapter;


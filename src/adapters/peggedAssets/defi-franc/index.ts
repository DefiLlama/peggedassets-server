const sdk = require("@defillama/sdk");
import {
    ChainBlocks,
    PeggedIssuanceAdapter,
} from "../peggedAsset.type";

const chainContracts = {
    ethereum: {
        issued: "0x045da4bFe02B320f4403674B3b7d121737727A36",
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
        return { peggedVAR: totalSupply / 10 ** 18 };
    };
}

const adapter: PeggedIssuanceAdapter = {
    ethereum: {
        minted: ethereumMinted(),
        unreleased: async () => ({}),
    }
};

export default adapter;
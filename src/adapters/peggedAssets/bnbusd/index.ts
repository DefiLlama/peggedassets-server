const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
    ChainBlocks,
    PeggedIssuanceAdapter,
    Balances,
} from "../peggedAsset.type";

type ChainContracts = {
    [chain: string]: {
        [contract: string]: string[];
    };
};

const chainContracts: ChainContracts = {
    bsc: {
        issued: ["0x5519a479Da8Ce3Af7f373c16f14870BbeaFDa265"],
    },
};

async function chainMinted(chain: string, decimals: number) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        let balances = {} as Balances;
        for (let issued of chainContracts[chain].issued) {
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
                false
            );
        }
        return balances;
    };
}

const adapter: PeggedIssuanceAdapter = {
    bsc: {
        minted: chainMinted("bsc", 18),
        unreleased: async () => ({}),
    },
};

export default adapter;

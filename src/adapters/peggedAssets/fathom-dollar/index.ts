const sdk = require("@defillama/sdk");
import { Chain } from "@defillama/sdk/build/general";
import { sumSingleBalance } from "../helper/generalUtil";
import {
    ChainBlocks,
    PeggedIssuanceAdapter,
    Balances,
} from "../peggedAsset.type";
import BigNumber from "bignumber.js";

type ChainContracts = {
    [chain: string]: {
        [contract: string]: string[];
    };
};

const chainContracts: ChainContracts = {
    xdc: {
        issued: ["0x49d3f7543335cf38Fa10889CCFF10207e22110B5"],
    },
};

async function chainMinted(chain: Chain, decimals: number) {
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
                new BigNumber(totalSupply).div(10 ** decimals).toNumber()
            );
        }
        return balances;
    };
}

const adapter: PeggedIssuanceAdapter = {
    xdc: {
        minted: chainMinted("xdc", 18),
        unreleased: async () => ({}),
    },
};

export default adapter;

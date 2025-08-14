import * as sdk from "@defillama/sdk";
import {
    ChainBlocks,
    PeggedIssuanceAdapter,
} from "../peggedAsset.type";
import { capABI, capConfig } from "./config";
import { interpretAsDecimals } from "./utils";

async function minted(chain: keyof typeof capConfig) {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        const infra = capConfig[chain].infra;
        const cUSD = capConfig[chain].tokens.cUSD;

        const totalSupplyRes = await sdk.api.abi.call({
            abi: "erc20:totalSupply",
            target: cUSD.address,
            block: _chainBlocks[chain],
            chain: chain,
        })
        const totalSupply = interpretAsDecimals(totalSupplyRes.output, cUSD.decimals);

        const priceRes = await sdk.api.abi.call({
            abi: capABI.PriceOracle.getPrice,
            target: infra.oracle.address,
            params: [cUSD.address],
            block: _chainBlocks[chain],
            chain: chain,
        })
        const priceUsd = interpretAsDecimals(priceRes.output[0], infra.oracle.priceDecimals);

        return { peggedUSD: totalSupply.multipliedBy(priceUsd).toNumber() };
    };
}


const adapter: PeggedIssuanceAdapter = {
    ethereum: {
        minted: minted("ethereum"),
    },
};

export default adapter;


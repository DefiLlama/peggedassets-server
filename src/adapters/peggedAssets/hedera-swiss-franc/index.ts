const axios = require("axios");
const retry = require("async-retry");
import {
    Balances,
    ChainBlocks,
    PeggedIssuanceAdapter,
} from "../peggedAsset.type";

async function hederaMinted() {
    return async function (
        _timestamp: number,
        _ethBlock: number,
        _chainBlocks: ChainBlocks
    ) {
        const issuance = await retry(
            async (_bail: any) =>
                await axios.get(
                    "https://mainnet-public.mirrornode.hedera.com/api/v1/tokens/0.0.6070123"
                )
        );
        const supply = issuance?.data?.total_supply;
        let balance = supply / 10 ** 8;
        return { peggedCHF: balance };
    };
}


const adapter: PeggedIssuanceAdapter = {
    hedera: {
        minted: hederaMinted(),
        unreleased: async () => ({}),
    },
};

export default adapter;
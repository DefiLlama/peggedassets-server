
export const capConfig = {
    ethereum: {
        infra: {
            oracle: {
                priceDecimals: 8,
                address: '0xcD7f45566bc0E7303fB92A93969BB4D3f6e662bb',
                fromBlock: 22867447,
            },
        },
        tokens: {
            cUSD: {
                id: 'cUSD',
                coingeckoId: 'cap-money-c-usd',
                decimals: 18,
                address: '0xcCcc62962d17b8914c62D74FfB843d73B2a3cccC',
                fromBlock: 22874015,
            },
        },
    },
} as const;


export const capABI = {
    PriceOracle: {
        getPrice: 'function getPrice(address asset) external view returns (uint256,uint256)',
    }
} as const
1. create adapter in {pegged asset's coingeckoID}/index.ts
2. test adapter: cd ./src/adapters/peggedAssets && npx ts-node test {peggedAssetGeckoId}/index peggedUSD
3. add export to index.ts
4. add new data entry to ../../protocols/peggedData.ts, including bridge info
5. add a chainlink feed to ChainlinkFeeds in prices/index.ts
6. add icon to https://github.com/DefiLlama/liquity-lusddefillama-app/public/pegged-icons

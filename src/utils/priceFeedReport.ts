import { asPrice, Pricing, PriceSeries } from "./pricing";

type FeedAsset = { id: string; symbol: string; gecko_id?: string | null; circulating: number; inactive: boolean };

const MIN_REPORT_TOKENS = 1_000_000;

const formatTokens = (tokens: number) => Math.round(tokens).toLocaleString("en-US");
const formatDay = (SK: number) => new Date(SK * 1000).toISOString().slice(0, 10);

export function pegFallbackLines(
  rows: Array<{ id: string; symbol: string; circulating: number; pricing: Pricing }>,
  valuedAt: number
): string[] {
  return rows
    .filter((row) => row.pricing.source === "peg" && row.circulating >= MIN_REPORT_TOKENS)
    .map(
      (row) =>
        `${row.symbol} (id ${row.id}): ${formatTokens(row.circulating)} tokens valued at the peg on ${formatDay(valuedAt)}, no usable market price`
    );
}

const maxReportRows = 25;
const maxReportLength = 1800;
const resolveLine =
  "Resolve: check https://coins.llama.fi/prices/current/coingecko:<gecko_id> for the id; a coin that is gone gets deadFrom in src/peggedData/peggedData.ts; the value stays at the last known price meanwhile.";

function formatTable(rows: string[][]): string {
  const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));
  return rows.map((row) => row.map((cell, column) => cell.padEnd(widths[column])).join(" | ").trimEnd()).join("\n");
}

function lostAssets(
  series: PriceSeries,
  current: Record<string, number | null | undefined> | null,
  assets: FeedAsset[]
) {
  const unpriced = assets.flatMap(({ gecko_id, ...asset }) =>
    gecko_id && !asset.inactive && asPrice(current?.[gecko_id]) === undefined ? [{ ...asset, gecko_id }] : []
  );
  const lost = unpriced
    .flatMap((asset) => {
      const entries = series.get(asset.gecko_id) ?? [];
      return entries.length ? [{ ...asset, last: entries[entries.length - 1] }] : [];
    })
    .sort((a, b) => b.circulating - a.circulating);
  return { unpriced, lost };
}

export function priceFeedReport(
  series: PriceSeries,
  current: Record<string, number | null | undefined> | null,
  assets: FeedAsset[]
): string | null {
  const { unpriced, lost } = lostAssets(series, current, assets);
  if (current !== null && !lost.length) return null;

  const rows = lost
    .filter((asset) => asset.circulating >= MIN_REPORT_TOKENS)
    .map((asset) => [
      asset.symbol,
      asset.id,
      asset.gecko_id,
      formatTokens(asset.circulating),
      String(Number(asset.last.price.toPrecision(4))),
      formatDay(asset.last.SK),
    ]);
  const unlisted = lost.length - rows.length;
  const heading = `**${current === null ? "Stablecoin price feed failed" : "Stablecoin prices"}: ${lost.length} lost, ${unpriced.length} with no price in this run**`;

  const render = (shown: number) =>
    [
      heading,
      ...(shown ? ["```", formatTable([["symbol", "id", "gecko", "tokens", "last price", "last seen"], ...rows.slice(0, shown)]), "```"] : []),
      ...(rows.length > shown ? [`and ${rows.length - shown} more`] : []),
      ...(unlisted ? [`Lost below ${formatTokens(MIN_REPORT_TOKENS)} tokens, not listed: ${unlisted}`] : []),
      resolveLine,
    ].join("\n");

  let shown = Math.min(rows.length, maxReportRows);
  while (shown > 0 && render(shown).length >= maxReportLength) shown--;
  return render(shown);
}

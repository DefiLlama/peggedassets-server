import { humanizeNumber } from "@defillama/sdk/build/computeTVL/humanizeNumber";
import { sendMessage } from "../../utils/discord";
import { ChainDrop, formatChainDrops } from "./chainDrops";

const MAX_TEAM_ALERTS = 10;

export function formatTeamChainDrops(drops: ChainDrop[]): string | undefined {
  const alerts = drops
    .filter((drop) => drop.protection === "held" || drop.protection === "fetch-failed")
    .sort((a, b) => (b.previous - b.current) - (a.previous - a.current));
  if (alerts.length === 0) return;

  const lines = ["Probable issue with stablecoin data:", "", "Chain circulating alerts:"];
  for (const drop of alerts.slice(0, MAX_TEAM_ALERTS)) {
    const current = drop.missing ? "missing" : drop.protection === "fetch-failed" ? "unavailable" : humanizeNumber(drop.current);
    const status = drop.protection === "held" ? "protected 12h" : "fallback kept";
    lines.push(`${drop.assetName} (id=${drop.assetId}) | ${drop.chain} | ${humanizeNumber(drop.previous)} → ${current} | ${status}`);
  }
  if (alerts.length > MAX_TEAM_ALERTS) lines.push(`... and ${alerts.length - MAX_TEAM_ALERTS} more`);
  return lines.join("\n");
}

export async function postChainDrops(
  drops: ChainDrop[],
  webhooks = { outdated: process.env.OUTDATED_WEBHOOK, team: process.env.TEAM_WEBHOOK },
): Promise<void> {
  if (drops.length === 0) return;
  const teamMessage = formatTeamChainDrops(drops);
  if (teamMessage && !webhooks.team) {
    console.warn("TEAM_WEBHOOK is not configured; chain protection alerts cannot reach the team channel");
  }

  await Promise.all([
    { webhook: webhooks.outdated, message: formatChainDrops(drops).join("\n"), formatted: false, channel: "OUTDATED_WEBHOOK" },
    { webhook: webhooks.team, message: teamMessage, formatted: true, channel: "TEAM_WEBHOOK" },
  ].map(async ({ webhook, message, formatted, channel }) => {
    if (!webhook || !message) return;
    try {
      await sendMessage(message, webhook, formatted);
    } catch (error) {
      console.error(`Failed to send chain alerts to ${channel}:`, error);
    }
  }));
}

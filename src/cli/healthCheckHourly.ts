import { getLastRecord, hourlyPeggedBalances } from "../peggedAssets/utils/getLastRecord";
import { getCurrentUnixTimestamp } from "../utils/date";
import { sendMessage } from "../utils/discord";

const MAX_AGE_MINUTES = Number(process.env.MAX_AGE_MINUTES ?? 120);
const WEBHOOK = process.env.HEALTHZ_WEBHOOK;

const ASSETS_TO_CHECK: Array<{ id: string; label: string }> = [
  { id: "1", label: "Tether (USDT)" },
  { id: "2", label: "USDC" },
];

async function main() {
  const now = getCurrentUnixTimestamp();

  const results = await Promise.all(
    ASSETS_TO_CHECK.map(async ({ id, label }) => {
      const item = await getLastRecord(hourlyPeggedBalances(id));
      const latestSK: number | null = item?.SK ?? null;
      const ageMinutes = latestSK ? Math.floor((now - latestSK) / 60) : null;
      return { id, label, latestSK, ageMinutes };
    })
  );

  const errors: string[] = [];
  for (const r of results) {
    if (r.latestSK === null) {
      errors.push(`${r.label} (id=${r.id}): no hourly record found at all`);
    } else if (r.ageMinutes !== null && r.ageMinutes > MAX_AGE_MINUTES) {
      errors.push(`${r.label} (id=${r.id}): stale ${r.ageMinutes}min (threshold ${MAX_AGE_MINUTES}min, latestSK=${r.latestSK})`);
    }
  }

  console.log("--- health check ---");
  console.log(`now: ${now}  threshold: ${MAX_AGE_MINUTES}min`);
  for (const r of results) {
    const status = r.latestSK === null
      ? "MISSING"
      : (r.ageMinutes! > MAX_AGE_MINUTES ? "STALE" : "OK");
    console.log(`${status.padEnd(8)} ${r.label.padEnd(20)} latestSK=${r.latestSK ?? "—"}  ageMinutes=${r.ageMinutes ?? "—"}`);
  }

  if (errors.length === 0) {
    console.log("--- OK, all assets fresh ---");
    process.exit(0);
  }

  const alertMsg =
    `🚨 **Stablecoin hourly freshness alert**\n` +
    errors.map((e) => `• ${e}`).join("\n");

  console.error("--- FAIL ---");
  console.error(alertMsg);

  if (WEBHOOK) {
    try {
      await sendMessage(alertMsg, WEBHOOK, false);
      console.log("Discord alert sent");
    } catch (e) {
      console.error("Failed to send Discord alert:", e);
    }
  } else {
    console.warn("HEALTHZ_WEBHOOK not set, skipping Discord notification");
  }

  process.exit(1);
}

main().catch((e) => {
  console.error("Health check threw an unexpected error:", e);
  process.exit(2);
});

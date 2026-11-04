

const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']

const priceCarryMaxDays = parsePriceCarryMaxDays(process.env.PRICE_CARRY_MAX_DAYS)

function parsePriceCarryMaxDays(value: string | undefined) {
  if (value === undefined) return undefined
  const days = value.trim()
  if (/^\d+(\.\d+)?$/.test(days)) return Number(days)
  console.warn(`PRICE_CARRY_MAX_DAYS "${value}" is not a plain decimal number of days, carried prices have no age limit`)
  return undefined
}

export function validateEnv() {
  const ENV = process.env

  if (requiredEnvVars.some((envVar) => !ENV[envVar]))
    throw new Error(`Missing required environment variables: ${requiredEnvVars.join(', ')}`)
}

export default function geEnv() {
  const ENV = process.env

  if (!process.env.tableName) process.env.tableName = 'prod-stablecoins-table'
  if (!process.env.AWS_REGION) process.env.AWS_REGION = 'eu-central-1'

  return {
    tableName: ENV.tableName,
    AWS_REGION: ENV.AWS_REGION,
    api2CacheDir: ENV.CACHE_DIR || __dirname + '/.api2-cache',
    priceCarryMaxDays,
    pricesWebhook: ENV.PRICES_WEBHOOK || undefined,
  }
}
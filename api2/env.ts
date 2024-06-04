

const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'API2_SUBPATH']

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
    api2CacheDir: __dirname + '/.api2-cache',
  }
}
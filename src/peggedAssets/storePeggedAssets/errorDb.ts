import mysql from 'mysql2/promise';

// Error tables
// CREATE TABLE errors (time INT, stablecoin VARCHAR(200), error TEXT, PRIMARY KEY(time, stablecoin), INDEX `idx_time` (`time` ASC) VISIBLE);
// CREATE TABLE errors2 (time INT, stablecoin VARCHAR(200), chain VARCHAR(200), error TEXT, PRIMARY KEY(time, stablecoin), INDEX `idx_time` (`time` ASC) VISIBLE);
// CREATE TABLE stale (time INT, stablecoin VARCHAR(200), lastUpdate INT, PRIMARY KEY(time, stablecoin), INDEX `idx_time` (`time` ASC) VISIBLE);

const connection = mysql.createPool({
  host: 'stablecoins-errors.cluster-cz3l9ki794cf.eu-central-1.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  database: 'stablecoins_errors',
  password: process.env.INFLUXDB_TOKEN,
  waitForConnections: false,
  connectionLimit: 5,
});

export function execute(sql: string, values: any){
  return connection.execute(sql, values)
}

export function executeAndIgnoreErrors(sql: string, values: any){
  console.info("attempted to store")
  console.info(sql)
  console.info(values)
    return connection.execute(sql, values)
    .catch(e => console.error("mysql error", e));
}

export function query(sql: string){
    return connection.query(sql)
    .catch(e => console.log("mysql error", e));
}
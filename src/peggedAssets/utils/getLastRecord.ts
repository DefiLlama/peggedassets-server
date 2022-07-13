import dynamodb from "../../utils/shared/dynamodb";

export function getLastRecord(PK: string) {
  return dynamodb
    .query({
      ExpressionAttributeValues: {
        ":pk": PK,
      },
      KeyConditionExpression: "PK = :pk",
      Limit: 1,
      ScanIndexForward: false,
    })
    .then((res) => res.Items?.[0]);
}

export const hourlyPeggedBalances = (protocolId: string) =>
  `hourlyPeggedBalances#${protocolId}`;
export const dailyPeggedBalances = (protocolId: string) =>
  `dailyPeggedBalances#${protocolId}`;
export const dailyPeggedPrices = () => "dailyPeggedPrices";
export const hourlyPeggedPrices = () => "hourlyPeggedPrices";
export const historicalRates = () => "historicalRates";

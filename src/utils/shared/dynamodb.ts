import { DynamoDBClient, } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument, GetCommandInput, PutCommandInput, QueryCommandInput, UpdateCommandInput, DeleteCommandInput, } from "@aws-sdk/lib-dynamodb"
import sleep from "./sleep";

const mockDynamoDBClient = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  }
});

const mockDynamoDBDocument = DynamoDBDocument.from(mockDynamoDBClient, {
  marshallOptions: {
    convertClassInstanceToMap: true,
  }
});

let ddbClient = mockDynamoDBClient;
let client = mockDynamoDBDocument;

try {
  ddbClient = new DynamoDBClient({
    region: 'eu-central-1',
    ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
      endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
      sslEnabled: false,
      region: "local",
      maxAttempts: 10
    })
  });

  client = DynamoDBDocument.from(ddbClient, {
    marshallOptions: {
      convertClassInstanceToMap: true,
    }
  })
} catch (e) {
  if (process.env.LOCAL_TEST)
    console.info("Running in local test mode, using local DynamoDB instance");
  else
    throw e
}


export const TableName = "prod-stablecoins-table";

export type DynamoDBItemKey = GetCommandInput["Key"]

const dynamodb = {
  get: (
    key: DynamoDBItemKey,
    params?: Omit<GetCommandInput, "TableName">
  ) => client.get({ TableName, ...params, Key: key }),
  put: (
    item: PutCommandInput["Item"],
    params?: Partial<PutCommandInput>
  ) => client.put({ TableName, ...params, Item: item }),
  query: (params: Omit<QueryCommandInput, "TableName">) =>
    client.query({ TableName, ...params }),
  update: (
    params: Omit<UpdateCommandInput, "TableName">
  ) => client.update({
    TableName,
    ...params,
    ...(params.ExpressionAttributeValues && {
      ExpressionAttributeValues: params.ExpressionAttributeValues
    })
  }),
  delete: (
    params: Omit<DeleteCommandInput, "TableName">
  ) => client.delete({ TableName, ...params }),
};
export default dynamodb;

export async function getHistoricalValues(pk: string, initialSK?: number) {
  let items = [] as any[];
  let lastKey = initialSK ? initialSK : -1;
  do {
    const result = await dynamodb.query({
      ExpressionAttributeValues: {
        ":pk": pk,
        ":sk": lastKey
      },
      KeyConditionExpression: "PK = :pk AND SK > :sk"
    });
    lastKey = result.LastEvaluatedKey?.SK;
    if (result.Items !== undefined) {
      items = items.concat(result.Items);
    }
  } while (lastKey !== undefined);
  return items;
}

import storePeggedAssets from "./peggedAssets/storePeggedAssets/storePegged";
import { wrapScheduledLambda } from "./utils/shared/wrap";
import dynamodb from "./utils/shared/dynamodb";

async function setEnvSecrets() {
  try {
    const { Item } = await dynamodb.getEnvSecrets();
    Object.entries(Item as any).forEach(([key, value]: any) => {
      if (key !== "PK" && key !== "SK") process.env[key] = value;
    });
  } catch (e) {
    console.log("Unable to get env secrets: ", e);
  }
}

const handler = async (event: any) => {
  await setEnvSecrets();
  await storePeggedAssets(event.peggedIndexes);
};

export default wrapScheduledLambda(handler);

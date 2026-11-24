import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const datasetBucket = "defillama-datasets";

let R2: S3Client | undefined;

function getR2Client() {
  if (R2) return R2;
  const { R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)
    throw new Error("Missing R2 env vars: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY");
  R2 = new S3Client({
    region: "auto",
    endpoint: "https://" + R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  return R2;
}

// Returns null when the key does not exist.
export async function getR2JSON(key: string): Promise<any> {
  try {
    const { Body } = await getR2Client().send(new GetObjectCommand({ Bucket: datasetBucket, Key: key }));
    return JSON.parse((await Body?.transformToString()) ?? "null");
  } catch (e: any) {
    if (e?.name === "NoSuchKey") return null;
    throw e;
  }
}

export async function storeR2JSON(key: string, data: any) {
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: datasetBucket,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
    })
  );
}

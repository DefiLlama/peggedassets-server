import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const s3 = new S3Client({});

export const datasetBucket = "llama-stablecoins-data";

function next21Minutedate() {
  const dt = new Date();
  dt.setHours(dt.getHours() + 1);
  dt.setMinutes(21);
  return dt;
}

export async function store(
  filename: string,
  body: string | Readable | Buffer,
  hourlyCache = false,
  compressed = true
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: datasetBucket,
      Key: filename,
      Body: body,
      ACL: "public-read",
      ...(hourlyCache && {
        Expires: next21Minutedate(),
        ...(compressed && {
          ContentEncoding: "br",
        }),
        ContentType: "application/json",
      }),
    })
  );
}

export async function storeDataset(
  filename: string,
  body: string,
  ContentType = "text/csv"
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: datasetBucket,
      Key: `temp/${filename}`,
      Body: body,
      ACL: "public-read",
      ContentType,
    })
  );
}

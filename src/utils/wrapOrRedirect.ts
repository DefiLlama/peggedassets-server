import { datasetBucket, storeDataset } from "./s3";
import { successResponse } from "./shared";

function buildRedirect(filename: string, cache?: number) {
    return {
        statusCode: 307,
        body: "",
        headers: {
            Location: `https://${datasetBucket}.s3.eu-central-1.amazonaws.com/temp/${filename}`,
            ...(cache !== undefined
                ? {
                    "Cache-Control": `max-age=${cache}`,
                }
                : {}),
        },
    };
}

export async function wrapResponseOrRedirect(response: any, cache: number) {
    const jsonData = JSON.stringify(response);
    const dataLength = Buffer.byteLength(jsonData, "utf8");

    if (dataLength < 5.5e6) {
        return successResponse(response, cache);
    } else {
        const filename = `stablecoin-${response.name}.json`;

        await storeDataset(filename, jsonData, "application/json");

        return buildRedirect(filename, 10 * 60);
    }
}
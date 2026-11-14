// 50% or more AI-generated
import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';

const bucket = process.env.S3_BUCKET ?? 'resources';

export async function uploadResourceFile(file: File): Promise<string> {
  const region = process.env.S3_REGION;
  const publicUrl = process.env.S3_PUBLIC_URL;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!region || !publicUrl || !accessKeyId || !secretAccessKey) {
    throw new Error('Storage is not configured.');
  }

  const client = new S3Client({
    region,
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });

  const path = `${crypto.randomUUID()}/${file.name}`;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type || 'application/octet-stream',
      }),
    );
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === 'EntityTooLarge' ||
        error.$metadata.httpStatusCode === 413)
    ) {
      throw new Error('The file is too large to be stored.');
    }
    throw error;
  }

  function trimTrailingSlashes(value: string): string {
    let end = value.length;
    while (end > 0 && value[end - 1] === '/') end--;
    return value.slice(0, end);
  }

  return `${trimTrailingSlashes(publicUrl)}/${path}`;
}

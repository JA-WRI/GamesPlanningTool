// 50% or more AI-generated
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadResourceFile } from '@/lib/storage';

const s3 = vi.hoisted(() => {
  class S3ServiceException extends Error {
    $metadata: { httpStatusCode?: number };

    constructor(name: string, status: number) {
      super(name);
      this.name = name;
      this.$metadata = { httpStatusCode: status };
    }
  }

  return {
    send: vi.fn(),
    client: vi.fn(),
    command: vi.fn(),
    S3ServiceException,
  };
});

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: class {
    constructor(input: unknown) {
      s3.client(input);
    }

    send = s3.send;
  },
  PutObjectCommand: class {
    constructor(input: unknown) {
      s3.command(input);
    }
  },
  S3ServiceException: s3.S3ServiceException,
}));

beforeEach(() => {
  vi.clearAllMocks();
  s3.send.mockResolvedValue({});
  vi.stubEnv('S3_REGION', 'us-east-1');
  vi.stubEnv('S3_ENDPOINT', 'https://project.supabase.co/storage/v1/s3');
  vi.stubEnv('S3_ACCESS_KEY_ID', 'access-key');
  vi.stubEnv('S3_SECRET_ACCESS_KEY', 'secret-key');
  vi.stubEnv('S3_FORCE_PATH_STYLE', 'true');
  vi.stubEnv('S3_PUBLIC_URL', 'https://cdn.example.com/resources');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('uploadResourceFile', () => {
  it('requires the storage configuration', async () => {
    vi.stubEnv('S3_REGION', '');

    await expect(
      uploadResourceFile(new File(['data'], 'plan.pdf')),
    ).rejects.toThrow('Storage is not configured.');
    expect(s3.send).not.toHaveBeenCalled();
  });

  it('throws when the upload fails', async () => {
    s3.send.mockRejectedValue(new Error('upload failed'));

    await expect(
      uploadResourceFile(new File(['data'], 'plan.pdf')),
    ).rejects.toThrow('upload failed');

    expect(s3.client).toHaveBeenCalledWith({
      region: 'us-east-1',
      endpoint: 'https://project.supabase.co/storage/v1/s3',
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
      forcePathStyle: true,
    });
  });

  it('reports a size error when storage rejects the upload', async () => {
    s3.send.mockRejectedValue(new s3.S3ServiceException('EntityTooLarge', 413));

    await expect(
      uploadResourceFile(new File(['data'], 'plan.pdf')),
    ).rejects.toThrow('The file is too large to be stored.');
  });

  it('returns the public URL of the uploaded file', async () => {
    const file = new File(['data'], 'plan.pdf', { type: 'application/pdf' });

    const result = await uploadResourceFile(file);

    expect(result).toMatch(
      /^https:\/\/cdn\.example\.com\/resources\/[0-9a-f-]{36}\/plan\.pdf$/,
    );
    expect(s3.command).toHaveBeenCalledWith({
      Bucket: 'resources',
      Key: expect.stringMatching(/^[0-9a-f-]{36}\/plan\.pdf$/),
      Body: Buffer.from('data'),
      ContentType: 'application/pdf',
    });
  });

  it('falls back to a generic content type', async () => {
    await uploadResourceFile(new File(['data'], 'file'));

    expect(s3.command).toHaveBeenCalledWith(
      expect.objectContaining({ ContentType: 'application/octet-stream' }),
    );
  });
});

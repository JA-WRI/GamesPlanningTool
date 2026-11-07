// 50% or more AI-generated
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadResourceFile } from '@/lib/supabase';

const supabase = vi.hoisted(() => {
  const upload = vi.fn();
  const getPublicUrl = vi.fn();
  const from = vi.fn(() => ({ upload, getPublicUrl }));
  const createClient = vi.fn(() => ({ storage: { from } }));
  return { upload, getPublicUrl, from, createClient };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: supabase.createClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('PROJECT_URL', 'https://project.supabase.co');
  vi.stubEnv('SERVICE_ROLE_KEY', 'service-role-key');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('uploadResourceFile', () => {
  it('requires the storage configuration', async () => {
    vi.stubEnv('PROJECT_URL', '');
    vi.stubEnv('SERVICE_ROLE_KEY', '');

    await expect(
      uploadResourceFile(new File(['data'], 'plan.pdf')),
    ).rejects.toThrow('Supabase storage is not configured.');
    expect(supabase.createClient).not.toHaveBeenCalled();
  });

  it('throws when the upload fails', async () => {
    supabase.upload.mockResolvedValue({ error: { message: 'upload failed' } });

    await expect(
      uploadResourceFile(new File(['data'], 'plan.pdf')),
    ).rejects.toThrow('upload failed');

    expect(supabase.createClient).toHaveBeenCalledWith(
      'https://project.supabase.co',
      'service-role-key',
    );
    expect(supabase.from).toHaveBeenCalledWith('resources');
  });

  it('returns the public URL of the uploaded file', async () => {
    const file = new File(['data'], 'plan.pdf', { type: 'application/pdf' });
    supabase.upload.mockResolvedValue({ error: null });
    supabase.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://cdn/plan.pdf' },
    });

    const result = await uploadResourceFile(file);

    expect(result).toBe('https://cdn/plan.pdf');
    const [path, uploadedFile, options] = supabase.upload.mock.calls[0];
    expect(path).toMatch(/^[0-9a-f-]{36}\/plan\.pdf$/);
    expect(uploadedFile).toBe(file);
    expect(options).toEqual({ contentType: 'application/pdf' });
    expect(supabase.getPublicUrl).toHaveBeenCalledWith(path);
  });

  it('falls back to a generic content type', async () => {
    supabase.upload.mockResolvedValue({ error: null });
    supabase.getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://cdn/file' },
    });

    await uploadResourceFile(new File(['data'], 'file'));

    expect(supabase.upload.mock.calls[0][2]).toEqual({
      contentType: 'application/octet-stream',
    });
  });
});

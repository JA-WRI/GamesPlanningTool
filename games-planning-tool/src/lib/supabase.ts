// 50% or more AI-generated
import { createClient } from '@supabase/supabase-js';

const bucket = process.env.SUPABASE_RESOURCES_BUCKET ?? 'resources';

export async function uploadResourceFile(file: File): Promise<string> {
  const url = process.env.PROJECT_URL;
  const key = process.env.SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase storage is not configured.');
  }

  const supabase = createClient(url, key);
  const path = `${crypto.randomUUID()}/${file.name}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
  });

  if (error) throw new Error(error.message);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

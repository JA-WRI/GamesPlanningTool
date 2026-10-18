// Made with AI agents (Antigravity)

/**
 * Generates a preview image or thumbnail for a given File object.
 */
export async function generateFileThumbnail(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }

  if (
    file.type.startsWith('text/') ||
    file.name.endsWith('.csv') ||
    file.name.endsWith('.md')
  ) {
    try {
      const text = await file.slice(0, 1000).text();
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = '#333333';
        ctx.font = '14px monospace';
        const lines = text.split('\n');
        for (let i = 0; i < Math.min(lines.length, 25); i++) {
          ctx.fillText(lines[i].substring(0, 60), 10, 20 + i * 16);
        }
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    } catch (e) {
      console.error('Failed to generate text preview', e);
    }
  }

  // Fallback for PDF, Word, Excel, etc. Create a clean document thumbnail
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 400, 400);

    ctx.fillStyle = '#8a181a';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    ctx.fillText(ext, 200, 180);

    ctx.fillStyle = '#495057';
    ctx.font = '24px sans-serif';
    const name =
      file.name.substring(0, 25) + (file.name.length > 25 ? '...' : '');
    ctx.fillText(name, 200, 240);

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  return '';
}

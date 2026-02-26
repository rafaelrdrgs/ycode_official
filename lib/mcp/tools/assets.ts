import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { uploadFile } from '@/lib/file-upload';

export function registerAssetTools(server: McpServer) {
  server.tool(
    'upload_asset',
    "Upload an image from a URL to YCode's asset library. Returns the asset record including its ID and public URL.",
    {
      url: z.string().url().describe('Public URL of the image to upload'),
      filename: z.string().optional().describe('Custom filename. Auto-detected from URL if omitted.'),
    },
    async ({ url, filename }) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          return { content: [{ type: 'text' as const, text: `Error: Failed to download image from ${url}: ${res.status}` }], isError: true };
        }

        const contentType = res.headers.get('content-type') || 'image/png';
        const buffer = await res.arrayBuffer();
        const blob = new Blob([buffer], { type: contentType });

        const derivedFilename = filename || url.split('/').pop()?.split('?')[0] || 'image.png';
        const file = new File([blob], derivedFilename, { type: contentType });

        const asset = await uploadFile(file, 'mcp');
        if (!asset) {
          return { content: [{ type: 'text' as const, text: 'Error: Failed to upload asset' }], isError: true };
        }

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify({
              message: `Uploaded "${asset.filename}" successfully`,
              asset_id: asset.id,
              public_url: asset.public_url,
              width: asset.width,
              height: asset.height,
            }, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Error uploading image: ${err instanceof Error ? err.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    },
  );
}

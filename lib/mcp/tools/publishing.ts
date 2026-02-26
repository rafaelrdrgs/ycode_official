import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getUnpublishedPages } from '@/lib/repositories/pageRepository';
import { getUnpublishedLayerStyles } from '@/lib/repositories/layerStyleRepository';

export function registerPublishingTools(server: McpServer) {
  server.tool(
    'get_unpublished_changes',
    'Check what changes are pending and need to be published',
    {},
    async () => {
      const [pages, styles] = await Promise.all([
        getUnpublishedPages().catch(() => []),
        getUnpublishedLayerStyles().catch(() => []),
      ]);

      const hasChanges = pages.length > 0 || styles.length > 0;

      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            has_unpublished_changes: hasChanges,
            unpublished_pages: pages.map((p) => ({ id: p.id, name: p.name })),
            unpublished_styles: styles.map((s) => ({ id: s.id, name: s.name })),
          }, null, 2),
        }],
      };
    },
  );
}

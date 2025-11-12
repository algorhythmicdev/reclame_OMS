// src/routes/api/profiles/templates/[code]/versions/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db/connection';

/**
 * GET /api/profiles/templates/:code/versions
 * Get version history for a template
 */
export const GET: RequestHandler = async ({ params, url, locals }) => {
  // Simple auth check - in production this would use proper auth middleware
  const user = locals.user || { id: 1, role: 'Admin', name: 'System' };

  const { code } = params;
  const includeSnapshots = url.searchParams.get('snapshots') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
    // Get template ID
    const templateResult = await query(
      'SELECT id FROM profile_templates WHERE code = $1',
      [code]
    );

    if (templateResult.rows.length === 0) {
      throw error(404, `Template ${code} not found`);
    }

    const templateId = templateResult.rows[0].id;

    // Get version history
    const versionsQuery = includeSnapshots
      ? `SELECT * FROM template_versions WHERE template_id = $1 ORDER BY created_at DESC LIMIT $2`
      : `SELECT 
          id, template_id, version, notes, changes_count, created_at, created_by
         FROM template_versions 
         WHERE template_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`;

    const versionsResult = await query(versionsQuery, [templateId, limit]);

    return json({
      code,
      versions: versionsResult.rows,
      total: versionsResult.rows.length
    });

  } catch (err: any) {
    console.error('Error loading versions:', err);
    if (err.status) throw err;
    throw error(500, 'Failed to load version history');
  }
};

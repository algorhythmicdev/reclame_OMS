// src/routes/api/profiles/templates/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db/connection';

/**
 * GET /api/profiles/templates
 * List all available profile templates
 */
export const GET: RequestHandler = async ({ url }) => {
  try {
    const activeOnly = url.searchParams.get('active') !== 'false';
    
    const result = await query(
      `SELECT 
        id,
        code,
        name,
        description,
        version,
        is_active,
        metadata,
        created_at,
        updated_at
       FROM profile_templates
       WHERE ($1 = false OR is_active = true)
       ORDER BY code`,
      [activeOnly]
    );

    return json({
      items: result.rows,
      total: result.rows.length
    });
  } catch (err) {
    console.error('Failed to fetch profile templates:', err);
    throw error(500, 'Failed to fetch profile templates');
  }
};

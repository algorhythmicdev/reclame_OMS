// src/routes/api/profiles/templates/[code]/rollback/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db/connection';

/**
 * POST /api/profiles/templates/:code/rollback
 * Rollback template to a specific version
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
  // Simple auth check - in production this would use proper auth middleware
  const user = locals.user || { id: 1, role: 'Admin', name: 'System' };
  
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
    throw error(403, 'Admin access required');
  }

  const { code } = params;

  try {
    const { version } = await request.json();

    if (!version) {
      throw error(400, 'Version parameter is required');
    }

    // Get template
    const templateResult = await query(
      'SELECT * FROM profile_templates WHERE code = $1',
      [code]
    );

    if (templateResult.rows.length === 0) {
      throw error(404, `Template ${code} not found`);
    }

    const template = templateResult.rows[0];

    // Get version snapshot
    const versionResult = await query(
      'SELECT * FROM template_versions WHERE template_id = $1 AND version = $2',
      [template.id, version]
    );

    if (versionResult.rows.length === 0) {
      throw error(404, `Version ${version} not found for template ${code}`);
    }

    const versionData = versionResult.rows[0];
    const snapshot = versionData.template_snapshot;

    await query('BEGIN');

    try {
      // Delete current sections and fields
      await query('DELETE FROM profile_sections WHERE template_id = $1', [template.id]);

      // Restore from snapshot
      if (snapshot.sections && Array.isArray(snapshot.sections)) {
        for (const sectionData of snapshot.sections) {
          const section = sectionData.section;
          const fields = sectionData.fields || [];

          // Insert section
          const sectionResult = await query(
            `INSERT INTO profile_sections (
              template_id, name, display_name_en, display_name_ru, display_name_lv,
              order_index, is_required, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
              template.id,
              section.name,
              section.display_name_en,
              section.display_name_ru,
              section.display_name_lv,
              section.order_index,
              section.is_required,
              JSON.stringify(section.metadata || {})
            ]
          );

          const newSection = sectionResult.rows[0];

          // Insert fields
          for (const field of fields) {
            await query(
              `INSERT INTO profile_fields (
                section_id, field_key, field_type, label_en, label_ru, label_lv,
                order_index, is_required, options, config,
                validation_rules, conditional_logic, metadata
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                newSection.id,
                field.field_key,
                field.field_type,
                field.label_en,
                field.label_ru,
                field.label_lv,
                field.order_index,
                field.is_required,
                JSON.stringify(field.options || []),
                JSON.stringify(field.config || {}),
                JSON.stringify(field.validation_rules || []),
                JSON.stringify(field.conditional_logic || []),
                JSON.stringify(field.metadata || {})
              ]
            );
          }
        }
      }

      // Update template version
      await query(
        'UPDATE profile_templates SET version = $1, updated_by = $2 WHERE id = $3',
        [version, user.name || 'system', template.id]
      );

      // Log rollback action
      await query(
        `INSERT INTO template_changes (
          template_id, change_type, entity_type, description, created_by
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          template.id,
          'ROLLED_BACK',
          'TEMPLATE',
          `Rolled back to version ${version}`,
          user.name || 'system'
        ]
      );

      await query('COMMIT');

      return json({
        success: true,
        message: `Template ${code} rolled back to version ${version}`,
        version
      });

    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }

  } catch (err: any) {
    console.error('Error rolling back template:', err);
    if (err.status) throw err;
    throw error(500, 'Failed to rollback template');
  }
};

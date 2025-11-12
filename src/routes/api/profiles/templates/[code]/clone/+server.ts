// src/routes/api/profiles/templates/[code]/clone/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db/connection';

/**
 * POST /api/profiles/templates/:code/clone
 * Clone an existing template to a new template
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
  // Simple auth check - in production this would use proper auth middleware
  const user = locals.user || { id: 1, role: 'Admin', name: 'System' };
  
  if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
    throw error(403, 'Admin access required');
  }

  const { code } = params;

  try {
    const { newCode, newName } = await request.json();

    if (!newCode) {
      throw error(400, 'New template code is required');
    }

    // Validate new code format
    if (!/^P[0-9A-Za-z\-_]+$/.test(newCode)) {
      throw error(400, 'Invalid code format. Must start with "P" followed by alphanumeric characters');
    }

    // Check if new code already exists
    const existingResult = await query(
      'SELECT id FROM profile_templates WHERE code = $1',
      [newCode]
    );

    if (existingResult.rows.length > 0) {
      throw error(409, `Template with code ${newCode} already exists`);
    }

    // Get source template with all details
    const templateResult = await query(
      'SELECT * FROM profile_templates WHERE code = $1',
      [code]
    );

    if (templateResult.rows.length === 0) {
      throw error(404, `Template ${code} not found`);
    }

    const sourceTemplate = templateResult.rows[0];

    await query('BEGIN');

    try {
      // 1. Clone template
      const clonedResult = await query(
        `INSERT INTO profile_templates (
          code, name, description, version, is_active, metadata,
          created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          newCode,
          newName || `${sourceTemplate.name} (Clone)`,
          sourceTemplate.description,
          '1.0',
          true,
          JSON.stringify(sourceTemplate.metadata),
          user.name || 'system',
          user.name || 'system'
        ]
      );

      const clonedTemplate = clonedResult.rows[0];

      // 2. Get and clone sections
      const sectionsResult = await query(
        'SELECT * FROM profile_sections WHERE template_id = $1 ORDER BY order_index',
        [sourceTemplate.id]
      );

      for (const section of sectionsResult.rows) {
        const clonedSectionResult = await query(
          `INSERT INTO profile_sections (
            template_id, name, display_name_en, display_name_ru, display_name_lv,
            order_index, is_required, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *`,
          [
            clonedTemplate.id,
            section.name,
            section.display_name_en,
            section.display_name_ru,
            section.display_name_lv,
            section.order_index,
            section.is_required,
            JSON.stringify(section.metadata)
          ]
        );

        const clonedSection = clonedSectionResult.rows[0];

        // 3. Clone fields
        const fieldsResult = await query(
          'SELECT * FROM profile_fields WHERE section_id = $1 ORDER BY order_index',
          [section.id]
        );

        for (const field of fieldsResult.rows) {
          await query(
            `INSERT INTO profile_fields (
              section_id, field_key, field_type, label_en, label_ru, label_lv,
              order_index, is_required, options, config,
              validation_rules, conditional_logic, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
              clonedSection.id,
              field.field_key,
              field.field_type,
              field.label_en,
              field.label_ru,
              field.label_lv,
              field.order_index,
              field.is_required,
              JSON.stringify(field.options),
              JSON.stringify(field.config),
              JSON.stringify(field.validation_rules),
              JSON.stringify(field.conditional_logic),
              JSON.stringify(field.metadata)
            ]
          );
        }
      }

      // 4. Create initial version snapshot for cloned template
      const snapshotResult = await query(
        `SELECT 
          row_to_json(pt.*) as template,
          (
            SELECT json_agg(
              jsonb_build_object(
                'section', row_to_json(ps.*),
                'fields', (
                  SELECT json_agg(pf.* ORDER BY pf.order_index)
                  FROM profile_fields pf
                  WHERE pf.section_id = ps.id
                )
              ) ORDER BY ps.order_index
            )
            FROM profile_sections ps
            WHERE ps.template_id = $1
          ) as sections
         FROM profile_templates pt
         WHERE pt.id = $1`,
        [clonedTemplate.id]
      );

      const snapshot = snapshotResult.rows[0];

      await query(
        `INSERT INTO template_versions (
          template_id, version, template_snapshot, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          clonedTemplate.id,
          '1.0',
          JSON.stringify(snapshot),
          `Cloned from ${code}`,
          user.name || 'system'
        ]
      );

      // 5. Log clone action for source template
      await query(
        `INSERT INTO template_changes (
          template_id, change_type, entity_type, description, created_by
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          sourceTemplate.id,
          'CLONED',
          'TEMPLATE',
          `Template cloned to ${newCode}`,
          user.name || 'system'
        ]
      );

      await query('COMMIT');

      return json({
        success: true,
        message: `Template ${code} cloned to ${newCode}`,
        newTemplate: clonedTemplate
      }, { status: 201 });

    } catch (err) {
      await query('ROLLBACK');
      throw err;
    }

  } catch (err: any) {
    console.error('Error cloning template:', err);
    if (err.status) throw err;
    throw error(500, 'Failed to clone template');
  }
};

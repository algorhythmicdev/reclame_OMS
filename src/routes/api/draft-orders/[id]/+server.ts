// src/routes/api/draft-orders/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query, transaction } from '$lib/server/db/connection';

/**
 * GET /api/draft-orders/[id] - Get single order with profiles
 */
export const GET: RequestHandler = async ({ params }) => {
  try {
    const sql = `
      SELECT 
        d.*,
        (
          SELECT json_agg(json_build_object(
            'id', op.id,
            'profileTemplateId', op.profile_template_id,
            'quantity', op.quantity,
            'configuration', op.configuration,
            'notes', op.notes
          ))
          FROM order_profiles op
          WHERE op.draft_order_id = d.id
        ) as profiles
      FROM draft_orders d
      WHERE d.po_number = $1 OR d.id::text = $1
    `;

    const result = await query(sql, [params.id]);

    if (result.rows.length === 0) {
      throw error(404, 'Order not found');
    }

    const row = result.rows[0];
    return json({
      id: row.po_number,
      dbId: row.id,
      client: row.client,
      title: row.title,
      due: row.due_date?.toISOString().slice(0, 10),
      loadingDate: row.loading_date?.toISOString().slice(0, 10),
      status: row.status,
      notes: row.notes,
      profiles: row.profiles || [],
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString()
    });
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Failed to fetch order:', err);
    throw error(500, 'Failed to fetch order');
  }
};

/**
 * PUT /api/draft-orders/[id] - Update order
 */
export const PUT: RequestHandler = async ({ params, request }) => {
  const data = await request.json();

  try {
    const result = await transaction(async (client) => {
      // Find the order first
      const findResult = await client.query(
        'SELECT id FROM draft_orders WHERE po_number = $1 OR id::text = $1',
        [params.id]
      );

      if (findResult.rows.length === 0) {
        throw { status: 404, message: 'Order not found' };
      }

      const orderId = findResult.rows[0].id;

      // Update order
      const updateSql = `
        UPDATE draft_orders SET
          client = COALESCE($2, client),
          title = COALESCE($3, title),
          due_date = COALESCE($4, due_date),
          loading_date = $5,
          status = COALESCE($6, status),
          notes = $7,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const orderResult = await client.query(updateSql, [
        orderId,
        data.client,
        data.title,
        data.due || null,
        data.loadingDate || null,
        data.status,
        data.notes ?? null
      ]);

      // Update profiles if provided
      if (data.profiles && Array.isArray(data.profiles)) {
        // Delete existing profiles
        await client.query('DELETE FROM order_profiles WHERE draft_order_id = $1', [orderId]);

        // Insert new profiles
        for (const profile of data.profiles) {
          await client.query(`
            INSERT INTO order_profiles (draft_order_id, profile_template_id, quantity, configuration, notes)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            orderId,
            profile.profileTemplateId || null,
            profile.quantity || 1,
            JSON.stringify(profile.configuration || {}),
            profile.notes || ''
          ]);
        }
      }

      return orderResult.rows[0];
    });

    return json({
      id: result.po_number,
      client: result.client,
      title: result.title,
      due: result.due_date?.toISOString().slice(0, 10),
      loadingDate: result.loading_date?.toISOString().slice(0, 10),
      status: result.status,
      notes: result.notes
    });
  } catch (err: any) {
    console.error('Failed to update order:', err);
    if (err.status === 404) throw error(404, err.message);
    throw error(500, 'Failed to update order');
  }
};

/**
 * DELETE /api/draft-orders/[id] - Delete order
 */
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const result = await query(
      'DELETE FROM draft_orders WHERE po_number = $1 OR id::text = $1 RETURNING po_number',
      [params.id]
    );

    if (result.rows.length === 0) {
      throw error(404, 'Order not found');
    }

    return json({ success: true, id: result.rows[0].po_number });
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Failed to delete order:', err);
    throw error(500, 'Failed to delete order');
  }
};

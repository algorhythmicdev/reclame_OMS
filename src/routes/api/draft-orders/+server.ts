import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query, transaction } from '$lib/server/db/connection';

/**
 * GET /api/draft-orders - List all draft orders
 */
export const GET: RequestHandler = async () => {
  const sql = `
    SELECT 
      d.*,
      (
        SELECT json_agg(json_build_object(
          'id', op.id,
          'profile_template_id', op.profile_template_id,
          'quantity', op.quantity,
          'configuration', op.configuration,
          'notes', op.notes
        ))
        FROM order_profiles op
        WHERE op.draft_order_id = d.id
      ) as profiles
    FROM draft_orders d
    ORDER BY d.created_at DESC
  `;
  
  const result = await query(sql);
  
  // Map database fields to frontend model if necessary
  const orders = result.rows.map(row => ({
    id: row.id,
    poNumber: row.po_number,
    clientName: row.client,
    title: row.title,
    deadline: row.due_date,
    loadingDate: row.loading_date,
    status: row.status,
    profiles: row.profiles || [],
    createdAt: row.created_at
  }));

  return json(orders);
};

/**
 * POST /api/draft-orders - Create a new draft order
 */
export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  
  // Validation
  if (!data.poNumber || !data.clientName) {
    return json({ message: 'PO Number and Client Name are required' }, { status: 400 });
  }

  try {
    const result = await transaction(async (client) => {
      // 1. Create Draft Order
      const orderSql = `
        INSERT INTO draft_orders (
          po_number, client, title, due_date, status, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, po_number, client, due_date, status
      `;
      
      const orderValues = [
        data.poNumber,
        data.clientName,
        data.title || `Order ${data.poNumber}`,
        data.deadline || null,
        'draft',
        data.notes || ''
      ];
      
      const orderResult = await client.query(orderSql, orderValues);
      const orderId = orderResult.rows[0].id;

      // 2. Create Profiles
      if (data.profiles && Array.isArray(data.profiles)) {
        for (const profile of data.profiles) {
          const profileSql = `
            INSERT INTO order_profiles (
              draft_order_id, quantity, configuration, notes
            ) VALUES ($1, $2, $3, $4)
          `;
          // Note: profile_template_id is omitted for now as we are using a hardcoded visual form
          // In a real scenario, we'd look up the template ID based on code 'P7st'
          
          await client.query(profileSql, [
            orderId,
            profile.quantity || 1,
            JSON.stringify(profile.configuration || {}),
            profile.notes || ''
          ]);
        }
      }
      
      return orderResult.rows[0];
    });

    return json(result, { status: 201 });
    
  } catch (err: any) {
    console.error('Error creating draft order:', err);
    if (err.code === '23505') { // Unique violation
      return json({ message: 'PO Number already exists' }, { status: 409 });
    }
    return json({ message: 'Failed to create order' }, { status: 500 });
  }
};

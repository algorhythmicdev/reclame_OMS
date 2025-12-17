// src/routes/api/files/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query, transaction } from '$lib/server/db/connection';
import { saveFile, getMimeType } from '$lib/files/storage';

/**
 * GET /api/files - List files with optional filters
 */
export const GET: RequestHandler = async ({ url }) => {
  const orderId = url.searchParams.get('orderId');
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let sql = `
    SELECT id, original_name, stored_name, mime_type, size, path, 
           category, order_id, uploaded_by, uploaded_at
    FROM files
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;

  if (orderId) {
    sql += ` AND order_id = $${idx}`;
    params.push(orderId);
    idx++;
  }

  if (category) {
    sql += ` AND category = $${idx}`;
    params.push(category);
    idx++;
  }

  sql += ` ORDER BY uploaded_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);

  try {
    const result = await query(sql, params);
    const files = result.rows.map(row => ({
      id: row.id,
      originalName: row.original_name,
      storedName: row.stored_name,
      mimeType: row.mime_type,
      size: row.size,
      path: row.path,
      category: row.category,
      orderId: row.order_id,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at
    }));

    return json(files);
  } catch (err) {
    console.error('Failed to list files:', err);
    throw error(500, 'Failed to list files');
  }
};

/**
 * POST /api/files - Upload file
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string | null;

    if (!file || !(file instanceof File)) {
      throw error(400, 'No file provided');
    }

    // Get user from session (optional)
    let uploadedBy: string | undefined;
    const token = cookies.get('session');
    if (token) {
      const crypto = await import('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const userResult = await query(
        `SELECT u.username FROM users u
         JOIN user_sessions s ON s.user_id = u.id
         WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
        [tokenHash]
      );
      if (userResult.rowCount && userResult.rowCount > 0) {
        uploadedBy = userResult.rows[0].username;
      }
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || getMimeType(file.name);

    // Save to filesystem
    const metadata = await saveFile(buffer, file.name, {
      mimeType,
      uploadedBy,
      orderId: orderId || undefined
    });

    // Save to database
    const result = await query(`
      INSERT INTO files (id, original_name, stored_name, mime_type, size, path, category, order_id, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      metadata.id,
      metadata.originalName,
      metadata.storedName,
      metadata.mimeType,
      metadata.size,
      metadata.path,
      metadata.category,
      orderId || null,
      uploadedBy || null
    ]);

    const row = result.rows[0];
    return json({
      id: row.id,
      originalName: row.original_name,
      storedName: row.stored_name,
      mimeType: row.mime_type,
      size: row.size,
      path: row.path,
      category: row.category,
      orderId: row.order_id,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at
    }, { status: 201 });

  } catch (err: any) {
    console.error('File upload error:', err);
    if (err.status) throw err;
    throw error(500, err.message || 'Failed to upload file');
  }
};

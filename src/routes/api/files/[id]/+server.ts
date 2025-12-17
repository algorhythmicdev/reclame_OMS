// src/routes/api/files/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { query } from '$lib/server/db/connection';
import { getFile, deleteFile, fileExists } from '$lib/files/storage';

/**
 * GET /api/files/[id] - Get file metadata or download file
 */
export const GET: RequestHandler = async ({ params, url }) => {
  const download = url.searchParams.get('download') === 'true';

  try {
    const result = await query(
      `SELECT id, original_name, stored_name, mime_type, size, path, 
              category, order_id, uploaded_by, uploaded_at
       FROM files WHERE id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      throw error(404, 'File not found');
    }

    const file = result.rows[0];

    // If download requested, return file content
    if (download) {
      const exists = await fileExists(file.path);
      if (!exists) {
        throw error(404, 'File not found on disk');
      }

      const buffer = await getFile(file.path);
      
      return new Response(buffer, {
        headers: {
          'Content-Type': file.mime_type,
          'Content-Length': String(buffer.length),
          'Content-Disposition': `attachment; filename="${file.original_name}"`
        }
      });
    }

    // Return metadata
    return json({
      id: file.id,
      originalName: file.original_name,
      storedName: file.stored_name,
      mimeType: file.mime_type,
      size: file.size,
      path: file.path,
      category: file.category,
      orderId: file.order_id,
      uploadedBy: file.uploaded_by,
      uploadedAt: file.uploaded_at
    });
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Failed to get file:', err);
    throw error(500, 'Failed to get file');
  }
};

/**
 * DELETE /api/files/[id] - Delete file
 */
export const DELETE: RequestHandler = async ({ params }) => {
  try {
    // Get file info first
    const result = await query(
      `SELECT path FROM files WHERE id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      throw error(404, 'File not found');
    }

    const filePath = result.rows[0].path;

    // Delete from database
    await query(`DELETE FROM files WHERE id = $1`, [params.id]);

    // Delete from filesystem (don't fail if already gone)
    try {
      await deleteFile(filePath);
    } catch (e) {
      console.warn('File already deleted from disk:', filePath);
    }

    return json({ success: true });
  } catch (err: any) {
    if (err.status) throw err;
    console.error('Failed to delete file:', err);
    throw error(500, 'Failed to delete file');
  }
};

import { json, method, validAdmin, supabaseAdmin, bucket, courseId } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!validAdmin(req)) return json(res, 403, { error: '沒有管理權限' });
  const id = String(req.query?.id || '');
  const { data: row } = await supabaseAdmin.from('works').select('object_path').eq('id', id).eq('course_id', courseId).eq('status','ready').single();
  if (!row) return json(res, 404, { error: '找不到作品' });
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(row.object_path, 120, { download: true });
  if (error) return json(res, 500, { error: '無法產生下載連結' });
  json(res, 200, { url: data.signedUrl });
}

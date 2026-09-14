import { json, method, validAdmin, supabaseAdmin, bucket, courseId } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!validAdmin(req)) return json(res, 403, { error: '沒有管理權限' });
  const { id } = req.body || {};
  const { data: row } = await supabaseAdmin.from('works').select('object_path').eq('id', id).eq('course_id', courseId).single();
  if (!row) return json(res, 404, { error: '找不到作品' });
  await supabaseAdmin.storage.from(bucket).remove([row.object_path]);
  await supabaseAdmin.from('works').update({ status: 'deleted' }).eq('id', id).eq('course_id', courseId);
  json(res, 200, { ok: true });
}

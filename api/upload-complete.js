import { json, method, validUploadToken, supabaseAdmin, bucket, courseId } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!validUploadToken(req)) return json(res, 403, { error: '上傳連結已失效或無效' });
  const { id } = req.body || {};
  if (!id) return json(res, 400, { error: '缺少作品識別碼' });

  const { data: row, error } = await supabaseAdmin.from('works')
    .select('id,object_path,status')
    .eq('id', id).eq('course_id', courseId).single();
  if (error || !row) return json(res, 404, { error: '找不到作品' });

  const folder = row.object_path.split('/').slice(0, -1).join('/');
  const filename = row.object_path.split('/').pop();
  const { data: found } = await supabaseAdmin.storage.from(bucket).list(folder, { search: filename, limit: 1 });
  if (!found?.some(x => x.name === filename)) return json(res, 409, { error: '檔案尚未完成上傳' });

  const { error: updateError } = await supabaseAdmin.from('works')
    .update({ status: 'ready', uploaded_at: new Date().toISOString() })
    .eq('id', id).eq('course_id', courseId);
  if (updateError) return json(res, 500, { error: '無法完成作品登記' });
  json(res, 200, { ok: true });
}

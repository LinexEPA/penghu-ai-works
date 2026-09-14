import { json, method, validShowToken, validAdmin, supabaseAdmin, bucket, courseId } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!validShowToken(req) && !validAdmin(req)) return json(res, 403, { error: '沒有展示權限' });

  const { data, error } = await supabaseAdmin.from('works')
    .select('id,group_no,title,object_path,mime_type,size_bytes,uploaded_at,created_at')
    .eq('course_id', courseId).eq('status', 'ready')
    .order('uploaded_at', { ascending: true });
  if (error) return json(res, 500, { error: '無法讀取作品' });

  const items = await Promise.all((data || []).map(async row => {
    const { data: signed } = await supabaseAdmin.storage.from(bucket).createSignedUrl(row.object_path, 600);
    return {
      id: row.id,
      groupNo: row.group_no,
      title: row.title || `第 ${row.group_no} 組作品`,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      uploadedAt: row.uploaded_at || row.created_at,
      url: signed?.signedUrl || null
    };
  }));

  json(res, 200, { items: items.filter(x => x.url) });
}

import { json, method, validUploadToken, validateUpload, cleanTitle, randomId, supabaseAdmin, bucket, courseId, getCourseSettings } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!validUploadToken(req)) return json(res, 403, { error: '上傳連結已失效或無效' });
  const settings = await getCourseSettings();
  if (!settings.isOpen) return json(res, 403, { error: '本次課程已停止收件' });

  const { groupNo, title, mimeType, sizeBytes } = req.body || {};
  const checked = validateUpload({ groupNo, mimeType, sizeBytes });
  if (checked.error) return json(res, 400, { error: checked.error });

  const id = crypto.randomUUID();
  const path = `${courseId}/g${String(checked.group).padStart(2,'0')}/${Date.now()}_${randomId()}${checked.ext}`;

  const { data: signed, error: signError } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
  if (signError) return json(res, 500, { error: '無法建立上傳授權' });

  const { error: dbError } = await supabaseAdmin.from('works').insert({
    id,
    course_id: courseId,
    group_no: checked.group,
    title: cleanTitle(title),
    object_path: path,
    mime_type: checked.mime,
    size_bytes: checked.size,
    status: 'pending'
  });
  if (dbError) return json(res, 500, { error: '無法建立作品紀錄' });

  json(res, 200, { id, path, signedUrl: signed.signedUrl });
}

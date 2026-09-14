import { json, method, validAdmin, supabaseAdmin, courseId, courseName, groupCount, getCourseSettings } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET','POST'])) return;
  if (!validAdmin(req)) return json(res, 403, { error: '沒有管理權限' });

  if (req.method === 'GET') {
    const settings = await getCourseSettings();
    return json(res, 200, {
      ...settings,
      uploadPath: `/upload?t=${encodeURIComponent(process.env.UPLOAD_TOKEN || '')}`,
      showPath: `/show?k=${encodeURIComponent(process.env.SHOW_TOKEN || '')}`
    });
  }

  const current = await getCourseSettings();
  const isOpen = typeof req.body?.isOpen === 'boolean' ? req.body.isOpen : current.isOpen;
  const newGroupCount = Number.isInteger(Number(req.body?.groupCount)) ? Math.min(30, Math.max(1, Number(req.body.groupCount))) : current.groupCount;
  const newName = String(req.body?.courseName || current.courseName || courseName).trim().slice(0,80);
  const { error } = await supabaseAdmin.from('course_settings').upsert({
    course_id: courseId,
    course_name: newName,
    is_open: isOpen,
    group_count: newGroupCount || groupCount,
    updated_at: new Date().toISOString()
  });
  if (error) return json(res, 500, { error: '無法更新課程設定' });
  json(res, 200, { ok: true, courseId, courseName: newName, isOpen, groupCount: newGroupCount });
}

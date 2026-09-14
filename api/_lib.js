import { createClient } from '@supabase/supabase-js';

const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!process.env.SUPABASE_URL) console.warn('[config] Missing SUPABASE_URL');
if (!supabaseSecret) console.warn('[config] Missing SUPABASE_SECRET_KEY');

export const bucket = process.env.SUPABASE_BUCKET || 'works-private';
export const courseId = process.env.COURSE_ID || 'penghu-2026';
export const courseName = process.env.COURSE_NAME || '澎湖 AI 微教學';
export const groupCount = Number(process.env.GROUP_COUNT || 6);
export const maxImageBytes = Number(process.env.MAX_IMAGE_MB || 10) * 1024 * 1024;
export const maxVideoBytes = Number(process.env.MAX_VIDEO_MB || 50) * 1024 * 1024;
export const isCourseOpen = () => String(process.env.COURSE_OPEN || 'true').toLowerCase() === 'true';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'http://localhost',
  supabaseSecret || 'missing',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export async function getCourseSettings() {
  const fallback = { courseId, courseName, isOpen: isCourseOpen(), groupCount };
  try {
    const { data } = await supabaseAdmin.from('course_settings').select('course_name,is_open,group_count').eq('course_id', courseId).maybeSingle();
    if (!data) return fallback;
    return { courseId, courseName: data.course_name || courseName, isOpen: !!data.is_open, groupCount: Number(data.group_count || groupCount) };
  } catch { return fallback; }
}

export function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store').json(body);
}

export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) {
    res.setHeader('Allow', allowed.join(', '));
    json(res, 405, { error: 'Method not allowed' });
    return false;
  }
  return true;
}

export function timingSafeEqualText(a = '', b = '') {
  if (!a || !b || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function getBearer(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

export function validUploadToken(req) {
  const supplied = req.query?.t || req.headers['x-upload-token'] || '';
  return timingSafeEqualText(String(supplied), String(process.env.UPLOAD_TOKEN || ''));
}

export function validShowToken(req) {
  const supplied = req.query?.k || req.headers['x-show-token'] || '';
  return timingSafeEqualText(String(supplied), String(process.env.SHOW_TOKEN || ''));
}

export function validAdmin(req) {
  const supplied = req.headers['x-admin-key'] || getBearer(req);
  return timingSafeEqualText(String(supplied), String(process.env.ADMIN_KEY || ''));
}

export function cleanTitle(value) {
  return String(value || '').trim().replace(/[<>\u0000-\u001F]/g, '').slice(0, 80);
}

const allowed = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['video/mp4', '.mp4'],
  ['video/quicktime', '.mov']
]);

export function validateUpload({ groupNo, mimeType, sizeBytes }) {
  const group = Number(groupNo);
  const size = Number(sizeBytes);
  const mime = String(mimeType || '').toLowerCase();
  if (!Number.isInteger(group) || group < 1 || group > groupCount) return { error: '組別不正確' };
  if (!allowed.has(mime)) return { error: '只接受 JPG、PNG、WEBP、MP4、MOV' };
  if (!Number.isFinite(size) || size <= 0) return { error: '檔案大小不正確' };
  const isImage = mime.startsWith('image/');
  const limit = isImage ? maxImageBytes : maxVideoBytes;
  if (size > limit) return { error: `檔案超過限制（${isImage ? process.env.MAX_IMAGE_MB || 10 : process.env.MAX_VIDEO_MB || 50} MB）` };
  return { group, mime, size, ext: allowed.get(mime) };
}

export function randomId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

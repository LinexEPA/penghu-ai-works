import { json, method, timingSafeEqualText } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const key = String(req.body?.key || '');
  if (!timingSafeEqualText(key, String(process.env.ADMIN_KEY || ''))) return json(res, 403, { error: '管理密碼錯誤' });
  json(res, 200, { ok: true });
}

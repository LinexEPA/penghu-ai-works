import { json, method, maxImageBytes, maxVideoBytes, getCourseSettings } from './_lib.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  const settings = await getCourseSettings();
  json(res, 200, {
    courseId: settings.courseId,
    courseName: settings.courseName,
    groupCount: settings.groupCount,
    open: settings.isOpen,
    maxImageMB: Math.round(maxImageBytes / 1024 / 1024),
    maxVideoMB: Math.round(maxVideoBytes / 1024 / 1024)
  });
}

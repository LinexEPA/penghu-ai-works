# 澎湖 AI 微教學｜作品上傳與展示平台

課堂用作品收件與展示平台。

- `/upload`：學員上傳圖片／短影片；不能瀏覽其他組作品。
- `/show`：講師作品牆；點選後放大圖片或播放影片。
- `/admin`：講師管理；可停止收件、下載、刪除。
- Supabase Storage 使用 private bucket；展示與下載皆使用短效 signed URL。

## 部署到 Vercel

在 Vercel 匯入此 GitHub repository，新增環境變數：

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`（只放 Vercel，絕對不要提交 GitHub）
- `SUPABASE_BUCKET=works-private`
- `COURSE_ID=penghu-2026`
- `COURSE_NAME=澎湖 AI 微教學`
- `GROUP_COUNT=6`
- `UPLOAD_TOKEN`：至少 32 字元隨機值
- `SHOW_TOKEN`：另一組至少 32 字元隨機值
- `ADMIN_KEY`：管理密碼，建議至少 16 字元
- `MAX_IMAGE_MB=10`
- `MAX_VIDEO_MB=50`

> 不需要開 GitHub Pages。本專案需要 Vercel Serverless API 才能安全簽發上傳、展示與下載授權。

## 課堂流程

1. 講師進 `/admin` 開放收件。
2. 後台複製學員上傳網址，做成 QR Code 或給短網址。
3. 學員用手機／平板／筆電上傳。
4. 講師開展示網址，作品牆每 5 秒更新；點作品即可放大。
5. 課程結束在 `/admin` 停止收件。

目前建議影片：20–60 秒、720p、30fps、MP4，50 MB 以下。

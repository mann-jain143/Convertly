# Convertly — Universal File Converter SaaS

Production-ready full-stack converter (documents, images, audio, video) with batch processing, queue-based conversion, and secure auto-cleanup.

## Supported Formats

- Documents: **PDF, DOCX, TXT, HTML, ODT, MD**
- Images: **JPG, PNG, WEBP, SVG**
- Audio: **MP3, WAV, AAC**
- Video: **MP4, AVI, MKV**

## Conversion Engine Routing

- **Pandoc** → text/document conversion
- **LibreOffice (soffice)** → office/PDF conversion
- **Sharp** → image conversion
- **FFmpeg** → audio/video conversion
- Fallback: **Pandoc → LibreOffice** when applicable

## Backend APIs

- `GET /api/health` - API + tool health
- `GET /api/formats` - dynamic source/target format matrix
- `POST /api/upload` - multi-file upload (`files[]` via multipart)
- `POST /api/convert` - batch convert using queue (`items[]`)
- `GET /api/download/:outputId` - download converted output and auto-delete

## Batch Conversion Payload

```json
{
  "globalTargetFormat": "pdf",
  "items": [
    { "fileId": "uuid-1", "targetFormat": "pdf" },
    { "fileId": "uuid-2", "targetFormat": "docx" }
  ]
}
```

## Local Development

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## Environment Variables (`server/.env`)

```bash
PORT=8080
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=100
```

## Docker

### Local full stack

```bash
cd docker
docker compose up --build
```

### Production backend image
Root `Dockerfile` includes Node + `ffmpeg` + `pandoc` + `libreoffice`.

## Render Deployment

### 1) Connect GitHub and deploy Blueprint

- Push repo to GitHub.
- Render → **New +** → **Blueprint**.
- Select repo; Render reads `render.yaml`.

### 2) Services created

- `convertly-api` (Docker web service)
- `convertly-web` (Static site)

### 3) Set/verify environment variables

**Backend:**
- `NODE_ENV=production`
- `PORT=8080`
- `MAX_FILE_SIZE_MB=100`
- `CLIENT_URL=https://<frontend>.onrender.com`

**Frontend:**
- `VITE_API_URL=https://<backend>.onrender.com`

### 4) Redeploy frontend

Vite env vars are build-time. Redeploy static site after updating `VITE_API_URL`.

### 5) End-to-end checks

- Open frontend and upload multiple files.
- Select global/per-file output format.
- Click **Convert All**.
- Download each converted file.
- Verify:
  - `GET https://<backend>/api/health`
  - `GET https://<backend>/api/formats`

## Cleanup & Limits

- Max file size: **100MB per file**
- Max uploaded files per request: **20**
- Auto-delete converted files after download or after **10 minutes**
- Scheduled cleanup via cron every minute

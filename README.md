# Convertly — Universal Secure File Converter SaaS

Convertly is a production-ready SaaS web application for secure multi-engine file conversion across documents, images, audio, and video.

## Features

- Universal upload and conversion with **28 supported input formats**
- Dynamic backend-driven format catalog (`GET /api/formats`)
- Unified conversion endpoint (`POST /api/convert`) with automatic engine routing
- Engine fallback strategy for docs: **Pandoc → LibreOffice fallback**
- 100MB upload limit and meaningful API errors
- Tool health checks for `pandoc`, `soffice`, `ffmpeg`
- Temporary storage with auto-delete after stream close and 5-minute scheduled cleanup
- Modern SaaS frontend with drag/drop, animated progress, dark mode, trust UI, legal pages, and i18n

## Project Structure

```bash
.
├── client/                 # React + Vite + Tailwind + Framer Motion
├── server/                 # Express API + conversion services
├── docker/                 # Local docker-compose setup
├── Dockerfile              # Render production Docker image (backend)
├── render.yaml             # Render Blueprint (API + static frontend)
└── README.md
```

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

```bash
cp server/.env.example server/.env
```

### 3) Run app

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

## API

### `GET /api/formats`
Returns:
- `formats`: source → target mapping
- `tools`: installed state for conversion binaries
- `warnings`: missing tool warnings
- `totalFormats`

### `POST /api/convert`
Multipart form-data fields:
- `file`: uploaded file
- `targetFormat`: desired output extension

Response: streamed converted file with download headers.

## Conversion Engines

- **Pandoc**: `txt ↔ docx ↔ md ↔ html ↔ pdf` and related text formats
- **LibreOffice (soffice)**: `pdf ↔ docx`, `doc/docx → pdf`, and Office-family conversions
- **Sharp**: image conversions (`jpg/png/webp/tiff/avif`)
- **FFmpeg**: media conversions (`mp4/mp3/avi/wav/...`)

---

## Deploy to Render (Docker + Static Site)

### Option A (Recommended): Blueprint deploy using `render.yaml`

1. Push this repository to GitHub.
2. In Render dashboard, click **New +** → **Blueprint**.
3. Select your Convertly GitHub repo.
4. Render auto-detects `render.yaml` and creates:
   - `convertly-api` (Docker web service)
   - `convertly-web` (static site)
5. Click **Apply**.
6. After first deploy, open service settings and confirm environment variables:

**Backend (`convertly-api`)**
- `NODE_ENV=production`
- `PORT=8080`
- `MAX_FILE_SIZE_MB=100`
- `CLIENT_URL=https://<your-frontend-domain>.onrender.com`

**Frontend (`convertly-web`)**
- `VITE_API_URL=https://<your-backend-domain>.onrender.com`

7. Trigger a frontend redeploy after updating `VITE_API_URL` so built assets point to live API.

### Option B: Manual Render setup

#### 1) Backend service (Docker)
- New + → **Web Service** → connect GitHub repo
- Environment: **Docker**
- Dockerfile path: `./Dockerfile`
- Health check path: `/api/health`
- Port: `8080` (service already listens to `process.env.PORT`)

Set env vars:
- `NODE_ENV=production`
- `PORT=8080`
- `MAX_FILE_SIZE_MB=100`
- `CLIENT_URL=https://<frontend-domain>.onrender.com`

#### 2) Frontend service (Static Site)
- New + → **Static Site** → connect same repo
- Root directory: `client`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

Set env var:
- `VITE_API_URL=https://<backend-domain>.onrender.com`

Redeploy frontend after setting env var.

---

## End-to-End verification checklist

1. Open frontend URL and upload a file.
2. Confirm output dropdown changes based on uploaded file type.
3. Convert and download output file.
4. Verify backend health endpoint: `GET https://<backend>/api/health`
5. Verify formats endpoint: `GET https://<backend>/api/formats`
6. Check Render logs for no missing-tool warnings (`pandoc`, `soffice`, `ffmpeg`).

## Docker (Local)

```bash
cd docker
docker compose up --build
```

## Cloud notes

- Backend requires binaries: `ffmpeg`, `pandoc`, `libreoffice` (included in root Dockerfile).
- Frontend API URL is compile-time (`VITE_API_URL`), so rebuild/redeploy after changes.

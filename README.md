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
├── docker/                 # Dockerfiles + compose
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

## Docker Deployment

```bash
cd docker
docker compose up --build
```

## Cloud Deployment

### Frontend (Vercel)
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Env: `VITE_API_URL=https://<api-domain>`

### Backend (Render/Railway)
- Root directory: `server`
- Start command: `npm start`
- Requires binaries: `ffmpeg`, `pandoc`, `libreoffice` (or deploy via Docker)

# Convertly — Universal Secure File Converter SaaS

Convertly is a production-ready SaaS web application for fast and secure file conversion across documents, images, audio, and video.

## Features

- Universal upload (PDF, DOCX, PPTX, XLSX, JPG, PNG, WEBP, MP4, MOV, MP3, WAV, TXT, MD)
- Dynamic output format detection
- Instant conversion pipeline
- Download-ready response stream
- 100MB file size limit
- Auto-cleanup after download and scheduled 5-minute retention purge
- Trust-first UX messaging and legal pages
- Dark mode + responsive premium landing page
- i18n (English + Spanish)
- Dockerized backend with LibreOffice + FFmpeg + Pandoc

## Project Structure

```bash
.
├── client/                 # React + Vite + Tailwind + Framer Motion
│   └── src/components/     # Upload and conversion UI components
├── server/                 # Express conversion API
│   └── src/services/       # Conversion + cleanup services
├── docker/                 # Dockerfiles + compose
└── README.md
```

## Local Setup

### 1) Install dependencies

```bash
npm install
npm install --workspace client
npm install --workspace server
```

### 2) Run development servers

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`

### 3) Environment variables

Copy and edit:

```bash
cp server/.env.example server/.env
```

Supported variables:

- `PORT` (default `8080`)
- `CLIENT_URL` (default `http://localhost:5173`)
- `MAX_FILE_SIZE_MB` (default `100`)

## API

### `GET /api/formats/:sourceExt`
Returns supported output formats for an input extension.

### `POST /api/convert`
Multipart form-data fields:
- `file`: uploaded file
- `targetFormat`: desired output extension

Response: streamed converted file with download headers.

## Conversion Engines

- **LibreOffice** for Office → PDF
- **FFmpeg** for audio/video
- **Sharp** for image conversion
- **Pandoc** for text/document formats

## Auto Cleanup Strategy

- Output file deleted immediately after download stream closes.
- Scheduled cleanup removes any upload/output file older than 5 minutes every minute.

## Deployment

### Docker

```bash
cd docker
docker compose up --build
```

### Vercel (Frontend)

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Env variable: `VITE_API_URL=https://<your-api-domain>`

### Render / Railway (Backend)

- Root directory: `server`
- Install: `npm install`
- Start: `npm start`
- Add apt packages or Docker deploy for `ffmpeg libreoffice pandoc`

## Production Notes

- Enable HTTPS and WAF in production.
- Add rate-limiting and auth for paid plans.
- Integrate object storage for scalable enterprise workflows if retention policies change.

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const formatLabels = {
  pdf: 'PDF',
  doc: 'DOC',
  docx: 'DOCX',
  txt: 'TXT',
  md: 'Markdown',
  html: 'HTML',
  rtf: 'RTF',
  odt: 'ODT',
  csv: 'CSV',
  xlsx: 'XLSX',
  ods: 'ODS',
  pptx: 'PPTX',
  odp: 'ODP',
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  tiff: 'TIFF',
  avif: 'AVIF',
  mp3: 'MP3',
  wav: 'WAV',
  aac: 'AAC',
  ogg: 'OGG',
  flac: 'FLAC',
  mp4: 'MP4',
  mov: 'MOV',
  avi: 'AVI',
  mkv: 'MKV',
};

export const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase();

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const formatLabels = {
  pdf: 'PDF',
  docx: 'DOCX',
  pptx: 'PPTX',
  xlsx: 'XLSX',
  txt: 'TXT',
  md: 'Markdown',
  jpg: 'JPG',
  png: 'PNG',
  webp: 'WEBP',
  mp3: 'MP3',
  wav: 'WAV',
  mp4: 'MP4',
  mov: 'MOV',
};

export const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase();

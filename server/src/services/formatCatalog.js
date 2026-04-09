export const FORMAT_CATALOG = {
  txt: ['docx', 'md', 'html', 'pdf', 'odt'],
  md: ['txt', 'docx', 'html', 'pdf', 'odt'],
  html: ['txt', 'docx', 'md', 'pdf', 'odt'],
  odt: ['txt', 'docx', 'pdf', 'html'],
  docx: ['pdf', 'txt', 'md', 'html', 'odt'],
  pdf: ['docx', 'txt', 'html', 'odt'],
  jpg: ['png', 'webp', 'svg'],
  jpeg: ['png', 'webp', 'svg'],
  png: ['jpg', 'webp', 'svg'],
  webp: ['jpg', 'png', 'svg'],
  svg: ['png', 'jpg', 'webp'],
  mp3: ['wav', 'aac', 'mp4', 'avi', 'mkv'],
  wav: ['mp3', 'aac', 'mp4', 'avi', 'mkv'],
  aac: ['mp3', 'wav', 'mp4', 'avi', 'mkv'],
  mp4: ['mp3', 'wav', 'aac', 'avi', 'mkv'],
  avi: ['mp3', 'wav', 'aac', 'mp4', 'mkv'],
  mkv: ['mp3', 'wav', 'aac', 'mp4', 'avi']
};

export const TOTAL_FORMATS = Object.keys(FORMAT_CATALOG).length;

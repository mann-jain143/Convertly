import { Download } from 'lucide-react';

export default function DownloadButton({ downloadUrl, fileName }) {
  if (!downloadUrl) return null;
  return (
    <a
      href={downloadUrl}
      download={fileName}
      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-5 py-3 font-semibold text-white shadow-glow"
    >
      <Download className="h-4 w-4" />
      Download converted file
    </a>
  );
}

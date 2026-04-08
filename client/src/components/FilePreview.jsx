import { File } from 'lucide-react';

export default function FilePreview({ file }) {
  if (!file) return null;
  return (
    <div className="glass mt-4 flex items-center gap-4 rounded-2xl p-4">
      <File className="h-8 w-8 text-brand-500" />
      <div>
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
      </div>
    </div>
  );
}

import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FileUpload({ onFileSelect }) {
  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-8 shadow-soft"
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-brand-500/50 p-10 text-center hover:border-brand-500">
        <UploadCloud className="mx-auto mb-4 h-10 w-10 text-brand-600" />
        <p className="text-lg font-semibold">Drag & drop any file here</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">or click to browse (max 100MB)</p>
        <input
          type="file"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        />
      </label>
    </motion.div>
  );
}

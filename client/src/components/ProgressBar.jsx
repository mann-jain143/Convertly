import { motion } from 'framer-motion';

export default function ProgressBar({ progress }) {
  return (
    <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <motion.div
        className="h-full bg-gradient-to-r from-brand-500 to-cyan-400"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />
    </div>
  );
}

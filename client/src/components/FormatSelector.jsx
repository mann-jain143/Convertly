import { formatLabels } from '../utils';

export default function FormatSelector({ formats, selected, onChange }) {
  if (!formats?.length) return null;
  return (
    <div className="mt-4">
      <label className="mb-2 block text-sm font-medium">Choose output format</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      >
        {formats.map((fmt) => (
          <option key={fmt} value={fmt}>
            {formatLabels[fmt] || fmt.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

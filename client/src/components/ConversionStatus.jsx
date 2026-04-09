export default function ConversionStatus({ status, error }) {
  if (status === 'idle') return null;
  if (status === 'loading') return <p className="mt-3 text-sm text-brand-600">Converting your file securely...</p>;
  if (status === 'success') return <p className="mt-3 text-sm text-emerald-600">Conversion complete! Ready to download.</p>;
  return <p className="mt-3 text-sm text-rose-500">{error || 'Conversion failed. Please try another format.'}</p>;
}

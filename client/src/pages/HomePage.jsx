import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import FilePreview from '../components/FilePreview';
import FormatSelector from '../components/FormatSelector';
import ProgressBar from '../components/ProgressBar';
import ConversionStatus from '../components/ConversionStatus';
import DownloadButton from '../components/DownloadButton';
import { API_URL, getExtension } from '../utils';

const trustItems = [
  '🔒 100% Secure File Processing',
  '🗑️ Files auto-deleted after conversion',
  '🚫 We never store your files',
  '⚡ Instant automated processing',
];

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [file, setFile] = useState(null);
  const [formats, setFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const resultName = useMemo(() => {
    if (!file || !selectedFormat) return '';
    const base = file.name.replace(/\.[^.]+$/, '');
    return `${base}.${selectedFormat}`;
  }, [file, selectedFormat]);

  const fetchFormats = async (selectedFile) => {
    const ext = getExtension(selectedFile.name);
    const res = await fetch(`${API_URL}/api/formats/${ext}`);
    if (!res.ok) throw new Error('Unsupported file type.');
    const data = await res.json();
    setFormats(data.formats);
    setSelectedFormat(data.formats[0] || '');
  };

  const onFileSelect = async (incomingFile) => {
    if (incomingFile.size > 100 * 1024 * 1024) {
      toast.error('File exceeds 100MB limit');
      return;
    }
    setFile(incomingFile);
    setDownloadUrl('');
    setStatus('idle');
    setError('');
    try {
      await fetchFormats(incomingFile);
      toast.success('File type detected.');
    } catch (err) {
      setFormats([]);
      setSelectedFormat('');
      setError(err.message);
      setStatus('error');
      toast.error(err.message);
    }
  };

  const convert = async () => {
    if (!file || !selectedFormat) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', selectedFormat);

    setStatus('loading');
    setProgress(10);

    const timer = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + 10));
    }, 250);

    try {
      const res = await fetch(`${API_URL}/api/convert`, { method: 'POST', body: formData });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || 'Conversion failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('success');
      setProgress(100);
      toast.success('Conversion complete');
    } catch (err) {
      setStatus('error');
      setError(err.message);
      toast.error(err.message);
    } finally {
      clearInterval(timer);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-4">
        <section className="grid gap-4 text-center">
          <h1 className="bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto max-w-3xl text-slate-600 dark:text-slate-300">{t('heroDescription')}</p>
          <div className="mx-auto flex gap-2">
            <button onClick={() => i18n.changeLanguage('en')} className="glass rounded-full px-3 py-1 text-sm">EN</button>
            <button onClick={() => i18n.changeLanguage('es')} className="glass rounded-full px-3 py-1 text-sm">ES</button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <FileUpload onFileSelect={onFileSelect} />
            <FilePreview file={file} />
            <FormatSelector formats={formats} selected={selectedFormat} onChange={setSelectedFormat} />
            {status === 'loading' && <ProgressBar progress={progress} />}
            <ConversionStatus status={status} error={error} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={convert}
              disabled={!file || !selectedFormat || status === 'loading'}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-500 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              Convert Now
            </motion.button>
            <DownloadButton downloadUrl={downloadUrl} fileName={resultName} />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-3xl p-6 shadow-soft">
              <h2 className="text-xl font-bold">Enterprise-grade trust</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {trustItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-3xl p-6 shadow-soft">
              <h3 className="text-lg font-semibold">Why teams choose Convertly</h3>
              <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                <p>• Universal conversion engine powered by LibreOffice, FFmpeg, Sharp, and Pandoc.</p>
                <p>• Auto-cleanup worker removes files after download or 5 minutes.</p>
                <p>• Modern UX with upload progress, smart format suggestions, and polished animations.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

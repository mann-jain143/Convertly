import { useEffect, useMemo, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';
import { Loader2, Trash2, UploadCloud, Download } from 'lucide-react';
import Header from '../components/Header';
import { API_URL, formatLabels, getExtension } from '../utils';

const statusColor = {
  uploading: 'text-sky-400',
  converting: 'text-amber-400',
  completed: 'text-emerald-400',
  failed: 'text-rose-400',
  idle: 'text-slate-400',
};

const trustItems = [
  '🔒 100% Secure File Processing',
  '🗑️ Files auto-deleted after conversion',
  '🚫 We never store your files',
  '⚡ Instant automated processing',
];

export default function HomePage() {
  const [catalog, setCatalog] = useState({});
  const [files, setFiles] = useState([]);
  const [globalFormat, setGlobalFormat] = useState('');
  const [useGlobalFormat, setUseGlobalFormat] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [converting, setConverting] = useState(false);
  const [engineWarnings, setEngineWarnings] = useState([]);

  const allCommonFormats = useMemo(() => {
    const flat = new Set();
    Object.values(catalog).forEach((targets) => targets.forEach((f) => flat.add(f)));
    return Array.from(flat);
  }, [catalog]);

  useEffect(() => {
    const boot = async () => {
      try {
        const res = await fetch(`${API_URL}/api/formats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed loading formats');
        setCatalog(data.formats || {});
        setEngineWarnings(data.warnings || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoadingCatalog(false);
      }
    };

    boot();
  }, []);

  const detectFileType = (file) => getExtension(file.name) || 'unknown';

  const createLocalFileItem = (file) => {
    const sourceExt = detectFileType(file);
    const formats = catalog[sourceExt] || [];
    return {
      localId: crypto.randomUUID(),
      file,
      serverFileId: null,
      sourceExt,
      availableFormats: formats,
      selectedFormat: formats[0] || '',
      status: 'idle',
      progress: 0,
      error: '',
      estimatedSeconds: Math.max(2, Math.round(file.size / (1024 * 1024))),
      downloadUrl: '',
      downloadName: '',
    };
  };

  const handleSelectFiles = (incoming) => {
    if (!incoming?.length) return;
    const prepared = incoming.map(createLocalFileItem);

    const unsupported = prepared.filter((f) => !f.availableFormats.length);
    if (unsupported.length) {
      toast.error(`Unsupported files skipped: ${unsupported.map((x) => x.file.name).join(', ')}`);
    }

    const valid = prepared.filter((f) => f.availableFormats.length);
    setFiles((prev) => [...prev, ...valid]);
  };

  const uploadAll = async () => {
    const pending = files.filter((f) => !f.serverFileId);
    if (!pending.length) return;

    const formData = new FormData();
    pending.forEach((f) => formData.append('files', f.file));

    setFiles((prev) => prev.map((f) => (!f.serverFileId ? { ...f, status: 'uploading', progress: 15 } : f)));

    try {
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setFiles((prev) =>
        prev.map((f) => {
          const hit = data.files.find((r) => r.originalName === f.file.name && r.size === f.file.size);
          if (!hit) return f;
          return {
            ...f,
            serverFileId: hit.id,
            sourceExt: hit.sourceExt,
            availableFormats: hit.availableFormats,
            selectedFormat: hit.availableFormats.includes(f.selectedFormat) ? f.selectedFormat : hit.availableFormats[0] || '',
            status: 'idle',
            progress: 0,
          };
        })
      );
      toast.success('Files uploaded successfully');
    } catch (error) {
      setFiles((prev) => prev.map((f) => (!f.serverFileId ? { ...f, status: 'failed', error: error.message } : f)));
      toast.error(error.message);
    }
  };

  const batchConvert = async () => {
    if (!files.length) return;
    setConverting(true);

    await uploadAll();

    const payloadItems = files
      .filter((f) => f.serverFileId)
      .map((f) => ({ fileId: f.serverFileId, targetFormat: useGlobalFormat ? globalFormat : f.selectedFormat }));

    if (!payloadItems.length) {
      toast.error('No uploaded files available to convert');
      setConverting(false);
      return;
    }

    if (payloadItems.some((i) => !i.targetFormat)) {
      toast.error('Please select target formats first');
      setConverting(false);
      return;
    }

    setFiles((prev) => prev.map((f) => ({ ...f, status: 'converting', progress: 35, error: '' })));

    try {
      const res = await fetch(`${API_URL}/api/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payloadItems, globalTargetFormat: useGlobalFormat ? globalFormat : '' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch conversion failed');

      setFiles((prev) =>
        prev.map((f) => {
          const result = data.results.find((r) => r.fileId === f.serverFileId);
          if (!result) return f;
          if (result.status === 'completed') {
            return {
              ...f,
              status: 'completed',
              progress: 100,
              downloadUrl: `${API_URL}${result.downloadUrl}`,
              downloadName: `${f.file.name.replace(/\.[^.]+$/, '')}.${result.targetFormat}`,
              estimatedSeconds: result.estimatedSeconds,
            };
          }
          return { ...f, status: 'failed', progress: 0, error: result.error || 'Conversion failed' };
        })
      );
      toast.success(`Batch done: ${data.successCount}/${data.results.length} files converted`);
    } catch (error) {
      setFiles((prev) => prev.map((f) => ({ ...f, status: 'failed', progress: 0, error: error.message })));
      toast.error(error.message);
    } finally {
      setConverting(false);
    }
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.localId !== id));
  const removeAllFiles = () => setFiles([]);

  const dropHandler = (e) => {
    e.preventDefault();
    handleSelectFiles(Array.from(e.dataTransfer.files || []));
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-12 text-slate-100">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4">
        <section className="text-center">
          <h1 className="bg-gradient-to-r from-brand-500 to-cyan-400 bg-clip-text text-4xl font-black text-transparent md:text-6xl">
            Universal File Converter
          </h1>
          <p className="mt-3 text-slate-300">Batch convert documents, images, audio, and video in one click.</p>
        </section>

        <section
          className="glass rounded-3xl border border-white/10 p-8 shadow-soft"
          onDrop={dropHandler}
          onDragOver={(e) => e.preventDefault()}
        >
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-brand-500/60 p-8 text-center">
            <UploadCloud className="mx-auto mb-3 h-9 w-9 text-brand-400" />
            <p className="font-semibold">Drag & drop files or click to select</p>
            <p className="text-sm text-slate-400">Supports batch upload (up to 20 files, 100MB each)</p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleSelectFiles(Array.from(e.target.files || []))}
            />
          </label>
        </section>

        <section className="glass rounded-3xl border border-white/10 p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={useGlobalFormat} onChange={(e) => setUseGlobalFormat(e.target.checked)} />
                Use global output format
              </label>
              {useGlobalFormat && (
                <select
                  value={globalFormat}
                  onChange={(e) => setGlobalFormat(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
                >
                  <option value="">Select format</option>
                  {allCommonFormats.map((fmt) => (
                    <option key={fmt} value={fmt}>{formatLabels[fmt] || fmt.toUpperCase()}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={removeAllFiles} className="rounded-xl border border-rose-600 px-3 py-2 text-rose-300">Remove All Files</button>
              <button
                onClick={batchConvert}
                disabled={!files.length || converting || loadingCatalog}
                className="rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {converting ? 'Converting...' : 'Convert All'}
              </button>
            </div>
          </div>

          <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-3">
            {files.map((fileItem) => (
              <Reorder.Item key={fileItem.localId} value={fileItem}>
                <motion.div layout className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{fileItem.file.name}</p>
                      <p className="text-xs text-slate-400">{(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB • est. {fileItem.estimatedSeconds}s</p>
                      <p className={`mt-1 text-xs font-medium ${statusColor[fileItem.status]}`}>{fileItem.status.toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!useGlobalFormat && (
                        <select
                          value={fileItem.selectedFormat}
                          onChange={(e) => setFiles((prev) => prev.map((f) => (f.localId === fileItem.localId ? { ...f, selectedFormat: e.target.value } : f)))}
                          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                        >
                          {fileItem.availableFormats.map((fmt) => (
                            <option key={fmt} value={fmt}>{formatLabels[fmt] || fmt.toUpperCase()}</option>
                          ))}
                        </select>
                      )}
                      <button onClick={() => removeFile(fileItem.localId)} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all" style={{ width: `${fileItem.progress}%` }} />
                  </div>

                  {fileItem.error && <p className="mt-2 text-xs text-rose-400">{fileItem.error}</p>}

                  {fileItem.downloadUrl && (
                    <a href={fileItem.downloadUrl} download={fileItem.downloadName} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-500 px-3 py-2 text-sm text-emerald-300">
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  )}
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {!files.length && <p className="py-8 text-center text-slate-400">No files selected yet.</p>}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-3xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold">Security & Trust</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {trustItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="glass rounded-3xl border border-white/10 p-5">
            <h3 className="text-lg font-semibold">Engine Health</h3>
            {loadingCatalog ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" />Checking tools...</p>
            ) : engineWarnings.length ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-300">
                {engineWarnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-emerald-400">All conversion engines ready.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

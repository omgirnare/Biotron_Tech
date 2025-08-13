import { useState } from 'react';

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setProgress(10);
    try {
      await onUpload(file, (p) => setProgress(p));
      setProgress(100);
      setFile(null);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 600);
    }
  }

  return (
    <form onSubmit={handleUpload}>
      <div>
        <label className="block text-sm text-slate-600">File</label>
        <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      {progress > 0 && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="mt-3">
        <button disabled={!file || busy} className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60" type="submit">{busy ? 'Uploading…' : 'Upload'}</button>
      </div>
    </form>
  );
}



'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

export default function EvidencePage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const maxDate = useMemo(() => todayIso(), []);
  const [occurredOn, setOccurredOn] = useState(maxDate);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (occurredOn > maxDate) {
      setError(t.report.futureDate);
      return;
    }
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('occurredOn', occurredOn);
    files.forEach((file) => data.append('files', file));
    try {
      await api(`/incidents/${id}/evidence`, { method: 'POST', body: data });
      await api(`/incidents/${id}/analyze`, { method: 'POST' });
      window.location.href = `/incidents/${id}/analysis`;
    } catch (err) {
      setError(err instanceof Error ? err.message : t.report.analyseFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="report-sheet">
        <BackLink href="/report" />
        <h1>{t.report.addInfo}</h1>
        <p className="tiny muted">{t.report.addHint}</p>
        <form onSubmit={onSubmit} className="report-form">
          <label className="upload-drop">
            <Icon name="folder" size={28} />
            <span>{t.report.upload}</span>
            <input
              name="files"
              type="file"
              multiple
              accept="image/*,application/pdf,text/plain,audio/*,video/*"
              onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 6))}
            />
          </label>
          {files.length > 0 && (
            <ul className="file-list">
              {files.map((file) => (
                <li key={`${file.name}-${file.size}`}>{file.name}</li>
              ))}
            </ul>
          )}
          <label className="field">{t.report.describe}
            <textarea name="note" rows={5} placeholder={t.report.placeholder} />
          </label>
          <div className="report-two">
            <label className="field">{t.report.platform}
              <select name="platform" defaultValue="WhatsApp">
                <option>WhatsApp</option>
                <option>TikTok</option>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>SMS</option>
                <option>{t.report.other}</option>
              </select>
            </label>
            <label className="field">{t.report.date}
              <input
                type="date"
                name="occurredOn"
                required
                max={maxDate}
                value={occurredOn}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next > maxDate) {
                    setError(t.report.futureDate);
                    setOccurredOn(maxDate);
                    return;
                  }
                  setError('');
                  setOccurredOn(next);
                }}
              />
            </label>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={loading}>{loading ? t.report.analysing : t.report.analyse}</button>
        </form>
      </div>
    </main>
  );
}

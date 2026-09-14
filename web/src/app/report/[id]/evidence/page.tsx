'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

export default function EvidencePage() {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const maxDate = useMemo(() => todayIso(), []);
  const [occurredOn, setOccurredOn] = useState(maxDate);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (occurredOn > maxDate) {
      setError('The date this happened cannot be in the future.');
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
      setError(err instanceof Error ? err.message : 'Could not analyse yet');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="report-sheet">
        <BackLink href="/report" />
        <h1>Add information</h1>
        <p className="tiny muted">A screenshot or file helps. If you cannot upload one, describe what you saw. SafeNest never asks for account passwords.</p>
        <form onSubmit={onSubmit} className="report-form">
          <label className="upload-drop">
            <Icon name="folder" size={28} />
            <span>Upload screenshots or other resources</span>
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
          <label className="field">Describe what happened
            <textarea name="note" rows={5} placeholder="They keep calling me names in the class WhatsApp group and told everyone to laugh at me." />
          </label>
          <div className="report-two">
            <label className="field">Platform
              <select name="platform" defaultValue="WhatsApp">
                <option>WhatsApp</option>
                <option>TikTok</option>
                <option>Instagram</option>
                <option>Facebook</option>
                <option>SMS</option>
                <option>Other</option>
              </select>
            </label>
            <label className="field">Date it happened
              <input
                type="date"
                name="occurredOn"
                required
                max={maxDate}
                value={occurredOn}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next > maxDate) {
                    setError('The date this happened cannot be in the future.');
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
          <button className="btn" disabled={loading}>{loading ? 'Analysing safely…' : 'Analyze Safely'}</button>
        </form>
      </div>
    </main>
  );
}

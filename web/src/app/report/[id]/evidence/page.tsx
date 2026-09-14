'use client';

import { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function EvidencePage() {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = event.currentTarget;
    const data = new FormData(form);
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
    <main className="screen">
      <a className="tiny muted" href="/report">← Back</a>
      <h1>Add information</h1>
      <p className="tiny muted">A screenshot helps. If you cannot upload one, describe what you saw. SafeNest never asks for account passwords.</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label className="field">📷 Upload screenshot
          <input name="file" type="file" accept="image/*" />
        </label>
        <label className="field">✍️ Describe what happened
          <textarea name="note" rows={5} placeholder="They keep calling me names in the class WhatsApp group and told everyone to laugh at me." />
        </label>
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
        <label className="field">Date
          <input type="date" defaultValue="2026-09-12" />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>{loading ? 'Analysing safely…' : 'Analyze Safely'}</button>
      </form>
    </main>
  );
}

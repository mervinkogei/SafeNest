'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';

const OPTIONS = [
  { id: 'bullying', label: 'Someone is bullying me' },
  { id: 'threatened', label: 'Someone threatened me' },
  { id: 'uncomfortable', label: 'Someone made me uncomfortable' },
  { id: 'private', label: 'Someone asked for something private' },
  { id: 'unsure', label: "I'm not sure" },
  { id: 'other', label: 'Other' },
];

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

export default function ReportPage() {
  const [children, setChildren] = useState<Array<{ id: string; displayName: string }>>([]);
  const [childId, setChildId] = useState('');
  const [role, setRole] = useState<string>('');
  const [occurredOn, setOccurredOn] = useState(todayIso);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const maxDate = useMemo(() => todayIso(), []);

  useEffect(() => {
    const account = currentUser();
    if (!account) {
      window.location.href = '/login';
      return;
    }
    setRole(account.role || '');
    api('/children').then((list) => {
      setChildren(list);
      if (list[0]) setChildId(list[0].id);
    }).catch(() => setChildren([]));
  }, []);

  function onFiles(list: FileList | null) {
    setFiles(Array.from(list || []).slice(0, 6));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (occurredOn > maxDate) {
      setError('The date this happened cannot be in the future.');
      return;
    }
    const form = new FormData(event.currentTarget);
    const description = String(form.get('description') || '').trim();
    if (!description && files.length === 0) {
      setError('Add a short description or upload a screenshot / file.');
      return;
    }
    setLoading(true);
    try {
      const incident = await api('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          category: form.get('category'),
          childId: role === 'PARENT' ? childId : undefined,
          platform: form.get('platform'),
          description,
          occurredOn,
        }),
      });
      if (files.length) {
        const evidence = new FormData();
        evidence.set('platform', String(form.get('platform') || 'WhatsApp'));
        evidence.set('occurredOn', occurredOn);
        files.forEach((file) => evidence.append('files', file));
        await api(`/incidents/${incident.id}/evidence`, { method: 'POST', body: evidence });
      }
      await api(`/incidents/${incident.id}/analyze`, { method: 'POST' });
      window.location.href = `/incidents/${incident.id}/analysis`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this incident');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="report-sheet">
        <BackLink href={role === 'CHILD' ? '/child' : '/parent'} label="Dashboard" />
        <p className="kicker">Record an incident</p>
        <h1>What happened?</h1>
        <p className="muted">Pick the child’s name, tell us what you saw, and add screenshots or other files if you have them. SafeNest never asks for account passwords.</p>

        <form onSubmit={onSubmit} className="report-form">
          {role === 'PARENT' && (
            <section className="report-block">
              <h3>Who is this about?</h3>
              {children.length ? (
                <label className="field">Child’s name
                  <select name="childId" required value={childId} onChange={(event) => setChildId(event.target.value)}>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>{child.displayName}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="error">
                  Add a child profile first, then come back to report.{' '}
                  <Link href="/children">Open child profiles</Link>
                </div>
              )}
            </section>
          )}

          <section className="report-block">
            <h3>What kind of harm?</h3>
            <div className="option-grid">
              {OPTIONS.map((option) => (
                <label className="option" key={option.id}>
                  <input type="radio" name="category" value={option.id} required />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="report-block">
            <h3>Details</h3>
            <label className="field">Describe what happened
              <textarea
                name="description"
                rows={5}
                placeholder="They keep calling me names in the class WhatsApp group and told everyone to laugh at me."
              />
            </label>
            <div className="report-two">
              <label className="field">Platform
                <select name="platform" defaultValue="WhatsApp">
                  <option>WhatsApp</option>
                  <option>TikTok</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>SMS</option>
                  <option>Email</option>
                  <option>School portal</option>
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
          </section>

          <section className="report-block">
            <h3>Screenshots and other files</h3>
            <p className="tiny muted">You can add images, PDFs, or short recordings. Up to 6 files, 8 MB each.</p>
            <label className="upload-drop">
              <Icon name="folder" size={28} />
              <span>Upload screenshots or other resources</span>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf,text/plain,audio/*,video/*"
                onChange={(event) => onFiles(event.target.files)}
              />
            </label>
            {files.length > 0 && (
              <ul className="file-list">
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>{file.name}</li>
                ))}
              </ul>
            )}
          </section>

          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={loading || (role === 'PARENT' && !childId)}>
            {loading ? 'Saving and analysing…' : 'Save and analyse safely'}
          </button>
        </form>
      </div>
    </main>
  );
}

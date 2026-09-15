'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

export default function ReportPage() {
  const { t } = useLang();
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
      setError(t.report.futureDate);
      return;
    }
    const form = new FormData(event.currentTarget);
    const description = String(form.get('description') || '').trim();
    if (!description && files.length === 0) {
      setError(t.report.needDesc);
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
      setError(err instanceof Error ? err.message : t.report.fail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="report-sheet">
        <BackLink href={role === 'CHILD' ? '/child' : '/parent'} label={t.common.dashboard} />
        <p className="kicker">{t.report.kicker}</p>
        <h1>{t.report.title}</h1>
        <p className="muted">{t.report.intro}</p>

        <form onSubmit={onSubmit} className="report-form">
          {role === 'PARENT' && (
            <section className="report-block">
              <h3>{t.report.who}</h3>
              {children.length ? (
                <label className="field">{t.report.childName}
                  <select name="childId" required value={childId} onChange={(event) => setChildId(event.target.value)}>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>{child.displayName}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="error">
                  {t.report.addChildFirst}{' '}
                  <Link href="/children">{t.report.openProfiles}</Link>
                </div>
              )}
            </section>
          )}

          <section className="report-block">
            <h3>{t.report.kind}</h3>
            <div className="option-grid">
              {(Object.entries(t.report.categories) as Array<[string, string]>).map(([id, label]) => (
                <label className="option" key={id}>
                  <input type="radio" name="category" value={id} required />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="report-block">
            <h3>{t.report.details}</h3>
            <label className="field">{t.report.describe}
              <textarea
                name="description"
                rows={5}
                placeholder={t.report.placeholder}
              />
            </label>
            <div className="report-two">
              <label className="field">{t.report.platform}
                <select name="platform" defaultValue="WhatsApp">
                  <option>WhatsApp</option>
                  <option>TikTok</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>SMS</option>
                  <option>Email</option>
                  <option>{t.report.schoolPortal}</option>
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
          </section>

          <section className="report-block">
            <h3>{t.report.files}</h3>
            <p className="tiny muted">{t.report.filesHint}</p>
            <label className="upload-drop">
              <Icon name="folder" size={28} />
              <span>{t.report.upload}</span>
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
            {loading ? t.report.saving : t.report.save}
          </button>
        </form>
      </div>
    </main>
  );
}

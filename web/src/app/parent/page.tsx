'use client';

import { useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import { copy, Lang } from '@/lib/i18n';

type Dash = {
  open: number;
  needsAttention: number;
  recent: Array<{
    id: string;
    riskType?: string;
    severity?: string;
    status: string;
    createdAt: string;
    category: string;
  }>;
};

function hello() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ParentHome() {
  const [data, setData] = useState<Dash | null>(null);
  const [notes, setNotes] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const user = currentUser();
  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];

  useEffect(() => {
    setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
    if (!currentUser()) {
      window.location.href = '/login';
      return;
    }
    api('/incidents/dashboard').then(setData).catch(() => setData({ open: 0, needsAttention: 0, recent: [] }));
    api('/notifications').then(setNotes).catch(() => setNotes([]));
  }, []);

  return (
    <main className="page">
      <div className="topbar">
        <div>
          <div className="tiny muted">{hello()}</div>
          <h2 style={{ margin: 0 }}>{user?.name || 'Caregiver'}</h2>
        </div>
        <a className="btn" href="/report">{t.report}</a>
      </div>
      <div className="grid-2" style={{ marginTop: 20 }}>
        <div>
          <section className="card">
            <h3 style={{ marginTop: 0 }}>Your Safety Overview</h3>
            <div className="stats">
              <div className="stat"><b>{data?.open ?? 0}</b>Open incidents</div>
              <div className="stat"><b>{data?.needsAttention ?? 0}</b>Needs attention</div>
            </div>
          </section>
          {notes[0] && (
            <div className="card" style={{ marginTop: 16 }}>
              <b>{notes[0].title}</b>
              <p className="tiny muted">{notes[0].body}</p>
            </div>
          )}
        </div>
        <div>
          <h3>Recent incidents</h3>
          {(data?.recent || []).map((item) => (
            <a className="list-item" key={item.id} href={`/incidents/${item.id}/analysis`} style={{ display: 'block', marginBottom: 10 }}>
              <div className="row">
                <b style={{ textTransform: 'capitalize' }}>{(item.riskType || item.category).replace('_', ' ')}</b>
                <span className={`badge ${item.severity || 'medium'}`}>{item.severity || item.status}</span>
              </div>
              <div className="tiny muted">{new Date(item.createdAt).toLocaleDateString()} • {item.status.replace('_', ' ')}</div>
            </a>
          ))}
          {!data?.recent?.length && <p className="muted tiny">No incidents yet. When something happens, report it here.</p>}
        </div>
      </div>
      <div className="nav" style={{ marginTop: 24 }}>
        <a className="pill" href="/locker">Evidence Locker</a>
        <a className="pill" href="/resources">Safety Resources</a>
        <a className="pill" href="/children">Child profiles</a>
      </div>
    </main>
  );
}

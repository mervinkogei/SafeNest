'use client';

import { useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import { copy, Lang } from '@/lib/i18n';
import { Icon, riskIcon } from '@/components/Icons';

type Dash = {
  open: number;
  needsAttention: number;
  resolved?: number;
  recent: Array<{
    id: string;
    riskType?: string;
    severity?: string;
    status: string;
    createdAt: string;
    category: string;
    platform?: string;
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
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [greeting, setGreeting] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];

  useEffect(() => {
    setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
    const account = currentUser();
    if (!account) {
      window.location.href = '/login';
      return;
    }
    setUser(account);
    setGreeting(hello());
    api('/incidents/dashboard').then(setData).catch(() => setData({ open: 0, needsAttention: 0, recent: [] }));
    api('/notifications').then(setNotes).catch(() => setNotes([]));
  }, []);

  if (!user) {
    return (
      <main className="page">
        <p className="muted">Loading your dashboard…</p>
      </main>
    );
  }

  const stats = [
    { label: 'Open', value: data?.open ?? 0, icon: 'inbox', tone: 'teal' },
    { label: 'Needs attention', value: data?.needsAttention ?? 0, icon: 'alert', tone: 'clay' },
    { label: 'Resolved', value: data?.resolved ?? 0, icon: 'shield', tone: 'ok' },
  ];

  return (
    <main className="page dash">
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <p className="kicker">{greeting}</p>
          <h1>{user.name || 'Caregiver'}</h1>
          <p className="muted">A calm place to understand what happened online and decide the next step.</p>
          <div className="actions">
            <a className="btn" href="/report"><Icon name="plus" size={18} /> {t.report}</a>
            <a className="btn secondary" href="/learn"><Icon name="book" size={18} /> Safety guide</a>
          </div>
        </div>
        <div className="dash-art" aria-hidden>
          <span className="ring ring-1" />
          <span className="ring ring-2" />
          <span className="ring ring-3" />
          <span className="dash-shield"><Icon name="shield" size={54} /></span>
        </div>
      </section>

      <section className="stat-row">
        {stats.map((stat) => (
          <article className={`stat-card tone-${stat.tone}`} key={stat.label}>
            <span className="stat-icon"><Icon name={stat.icon} /></span>
            <div>
              <b>{stat.value}</b>
              <p>{stat.label}</p>
            </div>
          </article>
        ))}
      </section>

      {notes[0] && (
        <div className="notice-card">
          <span className="stat-icon"><Icon name="bell" /></span>
          <div>
            <b>{notes[0].title}</b>
            <p className="tiny muted">{notes[0].body}</p>
          </div>
        </div>
      )}

      <section className="dash-split">
        <div>
          <div className="section-head">
            <h2>Recent incidents</h2>
            <a className="tiny" href="/locker">Open locker</a>
          </div>
          {(data?.recent || []).map((item) => (
            <article className="incident-card" key={item.id}>
              <span className={`incident-icon ${item.severity || 'medium'}`}>
                <Icon name={riskIcon(item.riskType)} />
              </span>
              <div className="incident-copy">
                <b style={{ textTransform: 'capitalize' }}>{(item.riskType || item.category).replaceAll('_', ' ')}</b>
                <p className="tiny muted">
                  {new Date(item.createdAt).toLocaleDateString()} · {item.platform || 'Online'} · {item.status.replaceAll('_', ' ')}
                </p>
                <span className={`badge ${item.severity || 'medium'}`}>{item.severity || item.status}</span>
              </div>
              <a className="btn secondary view-btn" href={`/incidents/${item.id}/analysis`}>
                <Icon name="eye" size={16} /> View incident
              </a>
            </article>
          ))}
          {!data?.recent?.length && (
            <div className="empty-card">
              <Icon name="inbox" size={32} />
              <p>No incidents yet. When something happens, record it here.</p>
              <a className="btn" href="/report">Report an incident</a>
            </div>
          )}
        </div>
        <aside>
          <h2>Quick actions</h2>
          <a className="action-tile" href="/locker"><Icon name="folder" /> Evidence locker</a>
          <a className="action-tile" href="/resources"><Icon name="phone" /> Trusted help lines</a>
          <a className="action-tile" href="/children"><Icon name="users" /> Child profiles</a>
          <a className="action-tile" href="/learn"><Icon name="book" /> Learn online safety</a>
        </aside>
      </section>
    </main>
  );
}

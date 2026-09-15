'use client';

import { useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import { useLang } from '@/lib/language';
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

function hello(t: ReturnType<typeof useLang>['t']) {
  const hour = new Date().getHours();
  if (hour < 12) return t.parent.morning;
  if (hour < 17) return t.parent.afternoon;
  return t.parent.evening;
}

export default function ParentHome() {
  const { t } = useLang();
  const [data, setData] = useState<Dash | null>(null);
  const [notes, setNotes] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const account = currentUser();
    if (!account) {
      window.location.href = '/login';
      return;
    }
    setUser(account);
    setGreeting(hello(t));
    api('/incidents/dashboard').then(setData).catch(() => setData({ open: 0, needsAttention: 0, recent: [] }));
    api('/notifications').then(setNotes).catch(() => setNotes([]));
  }, [t]);

  if (!user) {
    return (
      <main className="page">
        <p className="muted">{t.parent.loading}</p>
      </main>
    );
  }

  const stats = [
    { label: t.parent.open, value: data?.open ?? 0, icon: 'inbox', tone: 'teal' },
    { label: t.parent.needsAttention, value: data?.needsAttention ?? 0, icon: 'alert', tone: 'clay' },
    { label: t.parent.resolved, value: data?.resolved ?? 0, icon: 'shield', tone: 'ok' },
  ];

  return (
    <main className="page dash">
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <p className="kicker">{greeting}</p>
          <h1>{user.name || t.parent.caregiver}</h1>
          <p className="muted">{t.parent.intro}</p>
          <div className="actions">
            <a className="btn" href="/report"><Icon name="plus" size={18} /> {t.copy.report}</a>
            <button className="btn secondary" type="button" onClick={() => window.dispatchEvent(new Event('safenest-ai-open'))}>
              <Icon name="spark" size={18} /> {t.home.askAi}
            </button>
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
            <h2>{t.parent.recent}</h2>
            <a className="tiny" href="/locker">{t.parent.openLocker}</a>
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
                <Icon name="eye" size={16} /> {t.parent.viewIncident}
              </a>
            </article>
          ))}
          {!data?.recent?.length && (
            <div className="empty-card">
              <Icon name="inbox" size={32} />
              <p>{t.parent.empty}</p>
              <a className="btn" href="/report">{t.parent.report}</a>
            </div>
          )}
        </div>
        <aside>
          <h2>{t.parent.quick}</h2>
          <a className="action-tile" href="/locker"><Icon name="folder" /> {t.parent.locker}</a>
          <button className="action-tile" type="button" onClick={() => window.dispatchEvent(new Event('safenest-ai-open'))}>
            <Icon name="spark" /> {t.home.askAi}
          </button>
          <a className="action-tile" href="/resources"><Icon name="phone" /> {t.parent.helpLines}</a>
          <a className="action-tile" href="/children"><Icon name="users" /> {t.parent.profiles}</a>
          <a className="action-tile" href="/learn"><Icon name="book" /> {t.parent.learn}</a>
        </aside>
      </section>
    </main>
  );
}

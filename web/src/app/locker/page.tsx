'use client';

import { useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon, riskIcon } from '@/components/Icons';
import { useLang } from '@/lib/language';

export default function LockerIndex() {
  const { t } = useLang();
  const [incidents, setIncidents] = useState<Array<{
    id: string;
    riskType?: string;
    createdAt: string;
    status: string;
    platform?: string;
    severity?: string;
  }>>([]);
  useEffect(() => {
    if (!currentUser()) {
      window.location.href = '/login';
      return;
    }
    api('/incidents').then(setIncidents);
  }, []);

  return (
    <main className="page">
      <BackLink href="/parent" label={t.common.dashboard} />
      <h1>{t.locker.title}</h1>
      <p className="muted">{t.locker.intro}</p>
      <div className="locker-grid">
        {incidents.map((item) => (
          <article className="locker-card" key={item.id}>
            <span className={`incident-icon ${item.severity || 'medium'}`}>
              <Icon name={riskIcon(item.riskType)} />
            </span>
            <div className="incident-copy">
              <b style={{ textTransform: 'capitalize' }}>{(item.riskType || 'Incident').replaceAll('_', ' ')}</b>
              <p className="tiny muted">{new Date(item.createdAt).toLocaleDateString()} · {item.status.replaceAll('_', ' ')}</p>
            </div>
            <a className="btn secondary view-btn" href={`/incidents/${item.id}/locker`}>
              <Icon name="eye" size={16} /> {t.common.view}
            </a>
          </article>
        ))}
      </div>
      {!incidents.length && <p className="muted">{t.locker.empty}</p>}
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api, API_BASE, currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

type Resource = {
  id: string;
  name: string;
  description: string;
  website: string;
  phone?: string | null;
  emergency: boolean;
  source?: string;
  verifiedAt?: string;
  country?: string;
};

export default function ResourcesPage() {
  const { t } = useLang();
  const [resources, setResources] = useState<Resource[]>([]);
  const [error, setError] = useState('');
  const [back, setBack] = useState('/');

  useEffect(() => {
    const account = currentUser();
    setBack(account?.role === 'CHILD' ? '/child' : account ? '/parent' : '/');
    api('/resources')
      .then(setResources)
      .catch(() => {
        fetch(`${API_BASE}/resources/public`)
          .then((res) => res.json())
          .then((data) => setResources(Array.isArray(data) ? data : []))
          .catch(() => setError(t.resources.loadFail));
      });
  }, []);

  return (
    <main className="page">
      <BackLink href={back} label={back === '/' ? t.common.home : t.common.dashboard} />
      <p className="kicker">{t.resources.kicker}</p>
      <h1>{t.resources.title}</h1>
      <p className="muted">{t.resources.intro}</p>
      {error && <div className="error">{error}</div>}
      <div className="resource-grid">
        {resources.map((item) => (
          <article className="card resource-card" key={item.id}>
            <div className="resource-head">
              <span className="edu-icon"><Icon name={item.emergency ? 'alert' : 'phone'} /></span>
              <div>
                {item.emergency && <span className="badge critical">{t.common.emergency}</span>}
                <h3>{item.name}</h3>
              </div>
            </div>
            <p>{item.description}</p>
            {item.phone && <p className="resource-phone">{item.phone}</p>}
            {item.website && (
              <a href={item.website} target="_blank" rel="noreferrer">{item.website}</a>
            )}
            {(item.verifiedAt || item.source) && (
              <p className="tiny muted">
                {item.verifiedAt ? `${t.resources.verified} ${new Date(item.verifiedAt).toLocaleDateString()} · ` : ''}
                {item.country || 'Kenya'}
                {item.source ? ` · ${t.resources.source}: ${item.source}` : ''}
              </p>
            )}
          </article>
        ))}
      </div>
      {!resources.length && !error && <p className="muted">{t.resources.loading}</p>}
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api, API_BASE, currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';

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
          .catch(() => setError('Could not load trusted contacts right now.'));
      });
  }, []);

  return (
    <main className="page">
      <BackLink href={back} label={back === '/' ? 'Home' : 'Dashboard'} />
      <p className="kicker">Kenya · Verified contacts</p>
      <h1>Trusted resources</h1>
      <p className="muted">You do not need an account to use these numbers. They come from SafeNest’s verified list. The AI cannot invent phone numbers or organisations.</p>
      {error && <div className="error">{error}</div>}
      <div className="resource-grid">
        {resources.map((item) => (
          <article className="card resource-card" key={item.id}>
            <div className="resource-head">
              <span className="edu-icon"><Icon name={item.emergency ? 'alert' : 'phone'} /></span>
              <div>
                {item.emergency && <span className="badge critical">Emergency</span>}
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
                {item.verifiedAt ? `Verified ${new Date(item.verifiedAt).toLocaleDateString()} · ` : ''}
                {item.country || 'Kenya'}
                {item.source ? ` · Source: ${item.source}` : ''}
              </p>
            )}
          </article>
        ))}
      </div>
      {!resources.length && !error && <p className="muted">Loading trusted contacts…</p>}
    </main>
  );
}

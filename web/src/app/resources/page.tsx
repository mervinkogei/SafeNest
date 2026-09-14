'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';

type Resource = {
  id: string;
  name: string;
  description: string;
  website: string;
  phone?: string | null;
  emergency: boolean;
  source: string;
  verifiedAt: string;
  country: string;
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  useEffect(() => {
    api('/resources').then(setResources);
  }, []);

  return (
    <main className="page">
      <BackLink href="/parent" label="Dashboard" />
      <h1>Trusted resources</h1>
      <p className="tiny muted">These contacts come from SafeNest’s verified database. The AI cannot invent phone numbers or organisations.</p>
      <div className="locker-grid">
      {resources.map((item) => (
        <article className="card" key={item.id}>
          <div className="row">
            <b>{item.name}</b>
            {item.emergency && <span className="badge critical">Emergency</span>}
          </div>
          <p className="tiny">{item.description}</p>
          {item.phone && <p><b>{item.phone}</b></p>}
          <a className="tiny" href={item.website} target="_blank" rel="noreferrer">{item.website}</a>
          <p className="tiny muted">Verified {new Date(item.verifiedAt).toLocaleDateString()} · {item.country} · Source: {item.source}</p>
        </article>
      ))}
      </div>
    </main>
  );
}

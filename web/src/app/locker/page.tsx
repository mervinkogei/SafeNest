'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function LockerIndex() {
  const [incidents, setIncidents] = useState<Array<{ id: string; riskType?: string; createdAt: string; status: string }>>([]);
  useEffect(() => {
    api('/incidents').then(setIncidents);
  }, []);

  return (
    <main className="screen">
      <a className="tiny muted" href="/parent">← Dashboard</a>
      <h1>Evidence locker</h1>
      <p className="tiny muted">You control this record. Delete anything you do not want SafeNest to keep.</p>
      {incidents.map((item) => (
        <a className="list-item" key={item.id} href={`/incidents/${item.id}/locker`}>
          <b style={{ textTransform: 'capitalize' }}>{(item.riskType || 'Incident').replaceAll('_', ' ')}</b>
          <div className="tiny muted">{new Date(item.createdAt).toLocaleDateString()} · {item.status.replaceAll('_', ' ')}</div>
        </a>
      ))}
    </main>
  );
}

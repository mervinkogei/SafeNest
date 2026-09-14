'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE, api, getToken } from '@/lib/api';

type Incident = {
  id: string;
  platform: string;
  createdAt: string;
  status: string;
  riskType?: string;
  severity?: string;
  assessment?: { explanation: string; riskType: string } | null;
  evidence: Array<{ id: string; fileUrl: string; createdAt: string }>;
};

export default function LockerDetail() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    api(`/incidents/${id}`).then(setIncident);
  }, [id]);

  function evidenceSrc(fileUrl: string) {
    const filename = fileUrl.split('/').pop();
    return `${API_BASE}/incidents/${id}/evidence/${filename}`;
  }

  async function loadImage(fileUrl: string, img: HTMLImageElement) {
    const res = await fetch(evidenceSrc(fileUrl), {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await res.blob();
    img.src = URL.createObjectURL(blob);
  }

  if (!incident) return <main className="screen"><p>Opening locker…</p></main>;

  return (
    <main className="screen">
      <a className="tiny muted" href="/locker">← Evidence locker</a>
      <h1>Evidence locker</h1>
      <div className="card">
        <b style={{ textTransform: 'capitalize' }}>{(incident.riskType || 'incident').replaceAll('_', ' ')} #{incident.id.slice(-3)}</b>
        <p className="tiny muted">📅 {new Date(incident.createdAt).toLocaleDateString()} · 📱 {incident.platform}</p>
        <span className={`badge ${incident.severity || 'medium'}`}>{incident.severity || incident.status}</span>
      </div>
      <h3>Evidence</h3>
      {incident.evidence.length === 0 && <p className="tiny muted">No screenshot stored yet.</p>}
      {incident.evidence.map((item, index) => (
        <div className="card" key={item.id}>
          <p>Screenshot {index + 1}</p>
          <img
            alt=""
            style={{ width: '100%', borderRadius: 12, maxHeight: 180, objectFit: 'cover' }}
            ref={(node) => { if (node) loadImage(item.fileUrl, node); }}
          />
          <button
            className="btn ghost"
            onClick={async () => {
              await api(`/incidents/${id}/evidence/${item.id}`, { method: 'DELETE' });
              setIncident(await api(`/incidents/${id}`));
            }}
          >Delete this screenshot</button>
        </div>
      ))}
      <div className="card">
        <b>AI assessment</b>
        <p>{incident.assessment?.explanation || 'Not analysed yet.'}</p>
        <p className="tiny">Status: {incident.status.replaceAll('_', ' ')}</p>
      </div>
      <button
        className="btn"
        onClick={() => setSummary(
          `SafeNest incident summary\nDate: ${new Date(incident.createdAt).toLocaleString()}\nPlatform: ${incident.platform}\nPossible risk: ${(incident.riskType || 'unspecified').replaceAll('_', ' ')}\nSeverity: ${incident.severity || 'n/a'}\nThis is a record for a trusted adult. It is not a finding of guilt.`,
        )}
      >Generate Incident Summary</button>
      {summary && <pre className="card tiny" style={{ whiteSpace: 'pre-wrap' }}>{summary}</pre>}
    </main>
  );
}

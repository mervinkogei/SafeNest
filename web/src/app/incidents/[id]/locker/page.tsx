'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE, api, getToken } from '@/lib/api';
import BackLink from '@/components/BackLink';
import ConfirmDialog from '@/components/ConfirmDialog';

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
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingIncidentDelete, setPendingIncidentDelete] = useState(false);

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

  if (!incident) {
    return (
      <main className="page">
        <BackLink href="/locker" label="Evidence locker" />
        <p>Opening locker…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <BackLink href="/locker" label="Evidence locker" />
      <h1>Evidence locker</h1>
      <div className="locker-detail">
        <div className="card">
          <b style={{ textTransform: 'capitalize' }}>{(incident.riskType || 'incident').replaceAll('_', ' ')} #{incident.id.slice(-3)}</b>
          <p className="tiny muted">{new Date(incident.createdAt).toLocaleDateString()} · {incident.platform}</p>
          <span className={`badge ${incident.severity || 'medium'}`}>{incident.severity || incident.status}</span>
        </div>
        <div className="card">
          <b>AI assessment</b>
          <p>{incident.assessment?.explanation || 'Not analysed yet.'}</p>
          <p className="tiny">Status: {incident.status.replaceAll('_', ' ')}</p>
          <button
            className="btn"
            style={{ marginTop: 12 }}
            onClick={() => setSummary(
              `SafeNest incident summary\nDate: ${new Date(incident.createdAt).toLocaleString()}\nPlatform: ${incident.platform}\nPossible risk: ${(incident.riskType || 'unspecified').replaceAll('_', ' ')}\nSeverity: ${incident.severity || 'n/a'}\nThis is a record for a trusted adult. It is not a finding of guilt.`,
            )}
          >Generate Incident Summary</button>
          {summary && <pre className="tiny" style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{summary}</pre>}
        </div>
      </div>
      <h3>Evidence</h3>
      {incident.evidence.length === 0 && <p className="muted">No screenshot stored yet.</p>}
      <div className="evidence-grid">
        {incident.evidence.map((item, index) => (
          <div className="card" key={item.id}>
            <p>Screenshot {index + 1}</p>
            <img
              alt={`Screenshot ${index + 1}`}
              style={{ width: '100%', borderRadius: 12, maxHeight: 220, objectFit: 'cover' }}
              ref={(node) => { if (node) loadImage(item.fileUrl, node); }}
            />
            <button
              className="btn secondary"
              style={{ marginTop: 10, width: '100%' }}
              onClick={() => setPendingDelete(item.id)}
            >Delete</button>
          </div>
        ))}
      </div>
      <button className="btn danger" type="button" onClick={() => setPendingIncidentDelete(true)}>
        Delete this incident
      </button>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this screenshot?"
        body="This removes the saved image from the evidence locker. You cannot undo it."
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await api(`/incidents/${id}/evidence/${pendingDelete}`, { method: 'DELETE' });
          setPendingDelete(null);
          setIncident(await api(`/incidents/${id}`));
        }}
      />
      <ConfirmDialog
        open={pendingIncidentDelete}
        title="Delete this whole incident?"
        body="The report, screenshots, and AI notes for this incident will be removed."
        confirmLabel="Delete incident"
        danger
        onCancel={() => setPendingIncidentDelete(false)}
        onConfirm={async () => {
          await api(`/incidents/${id}`, { method: 'DELETE' });
          window.location.href = '/locker';
        }}
      />
    </main>
  );
}

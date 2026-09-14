'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';

type Incident = {
  id: string;
  assessment: {
    riskType: string;
    severity: string;
    confidence: number;
    indicators: string[];
    explanation: string;
    immediateSafetyConcern: boolean;
  } | null;
};

const SEVERITY_WIDTH: Record<string, string> = {
  low: '28%',
  medium: '52%',
  serious: '78%',
  critical: '94%',
};

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    api(`/incidents/${id}`).then(setIncident);
  }, [id]);

  const a = incident?.assessment;
  if (!a) {
    return (
      <main className="page">
        <BackLink href="/parent" label="Dashboard" />
        <p>Preparing a careful assessment…</p>
      </main>
    );
  }

  return (
    <main className="page">
      <BackLink href="/parent" label="Dashboard" />
      <p className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>AI safety analysis</p>
      <div className={`badge ${a.severity}`}>{a.immediateSafetyConcern ? 'Needs a trusted adult now' : 'Potential concern'}</div>
      <h1 style={{ textTransform: 'capitalize', margin: 0 }}>{a.riskType.replaceAll('_', ' ')} indicators</h1>
      <div className="card">
        <div className="row"><span>Severity</span><b style={{ textTransform: 'capitalize' }}>{a.severity}</b></div>
        <div className="meter"><span style={{ width: SEVERITY_WIDTH[a.severity] || '50%' }} /></div>
        <p className="tiny muted" style={{ marginBottom: 0 }}>AI assessment: {a.confidence >= 0.8 ? 'High confidence' : a.confidence >= 0.6 ? 'Moderate confidence' : 'Low confidence'}</p>
      </div>
      <section>
        <h3>Why was this flagged?</h3>
        <p>{a.explanation}</p>
      </section>
      <section>
        <h3>Indicators</h3>
        {a.indicators.map((item) => (
          <p key={item} className="tiny"><span className="check">✓</span> {item}</p>
        ))}
      </section>
      <a className="btn" href={`/incidents/${id}/plan`}>What should I do?</a>
      <a className="btn secondary" href={`/incidents/${id}/locker`}>Preserve evidence</a>
    </main>
  );
}

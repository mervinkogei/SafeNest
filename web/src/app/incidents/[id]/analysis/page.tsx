'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { useLang } from '@/lib/language';

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
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<Incident | null>(null);

  useEffect(() => {
    api(`/incidents/${id}`).then(setIncident);
  }, [id]);

  const a = incident?.assessment;
  if (!a) {
    return (
      <main className="page">
        <BackLink href="/parent" label={t.common.dashboard} />
        <p>{t.analysis.preparing}</p>
      </main>
    );
  }

  const confidence = a.confidence >= 0.8 ? t.analysis.high : a.confidence >= 0.6 ? t.analysis.medium : t.analysis.low;

  return (
    <main className="page">
      <BackLink href="/parent" label={t.common.dashboard} />
      <p className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t.analysis.kicker}</p>
      <div className={`badge ${a.severity}`}>{a.immediateSafetyConcern ? t.analysis.urgent : t.analysis.concern}</div>
      <h1 style={{ textTransform: 'capitalize', margin: 0 }}>{a.riskType.replaceAll('_', ' ')} {t.analysis.indicators}</h1>
      <div className="card">
        <div className="row"><span>{t.analysis.severity}</span><b style={{ textTransform: 'capitalize' }}>{a.severity}</b></div>
        <div className="meter"><span style={{ width: SEVERITY_WIDTH[a.severity] || '50%' }} /></div>
        <p className="tiny muted" style={{ marginBottom: 0 }}>{t.analysis.confidence}: {confidence}</p>
      </div>
      <section>
        <h3>{t.analysis.why}</h3>
        <p>{a.explanation}</p>
      </section>
      <section>
        <h3>{t.analysis.indicatorsTitle}</h3>
        {a.indicators.map((item) => (
          <p key={item} className="tiny"><span className="check">✓</span> {item}</p>
        ))}
      </section>
      <a className="btn" href={`/incidents/${id}/plan`}>{t.analysis.next}</a>
      <a className="btn secondary" href={`/incidents/${id}/locker`}>{t.analysis.briefing}</a>
      <a className="btn ghost" href={`/incidents/${id}/locker`}>{t.analysis.preserve}</a>
      <button
        className="btn ghost"
        type="button"
        style={{ marginTop: 12 }}
        onClick={() => window.dispatchEvent(new CustomEvent('safenest-ai-open', {
          detail: { prompt: `${t.analysis.askAbout}: ${a.riskType.replaceAll('_', ' ')}, ${t.analysis.severity} ${a.severity}. ${a.explanation}` },
        }))}
      >
        {t.analysis.askAbout}
      </button>
    </main>
  );
}

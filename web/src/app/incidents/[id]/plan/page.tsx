'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { useLang } from '@/lib/language';

export default function PlanPage() {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<{ severity: string; steps: string[]; immediateSafetyConcern: boolean } | null>(null);

  useEffect(() => {
    api(`/incidents/${id}/action-plan`).then(setPlan);
  }, [id]);

  return (
    <main className="page">
      <BackLink href={`/incidents/${id}/analysis`} label={t.analysis.kicker} />
      <p className="tiny muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t.analysis.planKicker}</p>
      <div className={`badge ${plan?.severity || 'serious'}`}>
        {plan?.immediateSafetyConcern ? t.analysis.urgentHuman : t.analysis.serious}
      </div>
      <ol style={{ paddingLeft: 18, lineHeight: 1.55 }}>
        {(plan?.steps || []).map((step) => (
          <li key={step} style={{ marginBottom: 12 }}>{step}</li>
        ))}
      </ol>
      <a className="btn" href={`/incidents/${id}/locker`}>{t.analysis.savePlan}</a>
      <a className="btn secondary" href="/resources">{t.analysis.resources}</a>
    </main>
  );
}

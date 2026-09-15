'use client';

import { copy } from '@/lib/i18n';
import BackLink from '@/components/BackLink';
import { useLang } from '@/lib/language';

export default function RolePage() {
  const { lang, t } = useLang();
  const c = copy[lang];

  function choose(role: string) {
    localStorage.setItem('safenest_role', role);
    window.location.href = `/register?role=${role}`;
  }

  return (
    <main className="page">
      <div className="form-card">
        <BackLink href="/learn" label={t.auth.safetyGuide} />
        <h1>{c.chooseRole}</h1>
        <p className="tiny muted">{t.auth.roleHint}</p>
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <button className="choice" onClick={() => choose('PARENT')}>
            <b>👨‍👩‍👧 {c.parent}</b>
            <span className="tiny muted">{c.parentHint}</span>
          </button>
          <button className="choice" onClick={() => choose('CHILD')}>
            <b>🧒 {c.child}</b>
            <span className="tiny muted">{c.childHint}</span>
          </button>
        </div>
      </div>
    </main>
  );
}

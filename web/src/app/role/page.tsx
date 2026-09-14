'use client';

import { useEffect, useState } from 'react';
import { copy, Lang } from '@/lib/i18n';
import BackLink from '@/components/BackLink';

export default function RolePage() {
  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];
  useEffect(() => {
    setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
  }, []);

  function choose(role: string) {
    localStorage.setItem('safenest_role', role);
    window.location.href = `/register?role=${role}`;
  }

  return (
    <main className="page">
      <div className="form-card">
        <BackLink href="/learn" label="Safety guide" />
        <h1>{t.chooseRole}</h1>
        <p className="tiny muted">You can still go back and learn. Recording an incident comes after you understand what help looks like.</p>
        <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <button className="choice" onClick={() => choose('PARENT')}>
            <b>👨‍👩‍👧 {t.parent}</b>
            <span className="tiny muted">{t.parentHint}</span>
          </button>
          <button className="choice" onClick={() => choose('CHILD')}>
            <b>🧒 {t.child}</b>
            <span className="tiny muted">{t.childHint}</span>
          </button>
        </div>
      </div>
    </main>
  );
}

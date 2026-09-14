'use client';

import { useEffect, useState } from 'react';
import { copy, Lang } from '@/lib/i18n';

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
    <main className="screen">
      <a className="tiny muted" href="/">← Back</a>
      <h1>{t.chooseRole}</h1>
      <button className="choice" onClick={() => choose('PARENT')}>
        <b>👨‍👩‍👧 {t.parent}</b>
        <span className="tiny muted">{t.parentHint}</span>
      </button>
      <button className="choice" onClick={() => choose('CHILD')}>
        <b>🧒 {t.child}</b>
        <span className="tiny muted">{t.childHint}</span>
      </button>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { copy, Lang } from '@/lib/i18n';

export default function WelcomePage() {
  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];

  useEffect(() => {
    const stored = localStorage.getItem('safenest_lang') as Lang | null;
    if (stored) setLang(stored);
  }, []);

  function toggle() {
    const next = lang === 'en' ? 'sw' : 'en';
    setLang(next);
    localStorage.setItem('safenest_lang', next);
  }

  return (
    <main className="screen">
      <div className="topbar">
        <span className="tiny muted">Kenya</span>
        <button className="lang" onClick={toggle}>{lang === 'en' ? 'Kiswahili' : 'English'}</button>
      </div>
      <div className="grow center">
        <div className="hero-mark" aria-hidden>🛡️</div>
        <h1>SafeNest</h1>
        <p>{t.tagline}</p>
        <p className="muted">{t.welcomeBody}</p>
      </div>
      <a className="btn" href="/role">{t.getStarted}</a>
      <a className="btn ghost" href="/login">{t.haveAccount}</a>
    </main>
  );
}

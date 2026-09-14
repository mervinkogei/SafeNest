'use client';

import { useEffect, useState } from 'react';
import { copy, education, Lang } from '@/lib/i18n';
import { API_BASE } from '@/lib/api';

type Helpline = { id: string; name: string; phone?: string | null; description: string };

export default function WelcomePage() {
  const [lang, setLang] = useState<Lang>('en');
  const [lines, setLines] = useState<Helpline[]>([]);
  const t = copy[lang];
  const e = education[lang];

  useEffect(() => {
    const sync = () => setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
    sync();
    window.addEventListener('safenest-lang', sync);
    fetch(`${API_BASE}/resources/public`)
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setLines(data) : setLines([]))
      .catch(() => setLines([]));
    return () => window.removeEventListener('safenest-lang', sync);
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <div className="kicker">{e.kicker}</div>
          <h1>{e.heroTitle}</h1>
          <p className="muted" style={{ fontSize: '1.15rem', lineHeight: 1.55 }}>{e.heroBody}</p>
          <div className="actions">
            <a className="btn secondary" href="/learn">{t.learnFirst}</a>
            <a className="btn" href="/role">{t.getStarted}</a>
            <a className="btn ghost" href="/login">{t.haveAccount}</a>
          </div>
        </div>
        <aside className="hero-panel">
          <div className="hero-mark" aria-hidden>🛡️</div>
          <h2>SafeNest</h2>
          <p>{t.tagline}</p>
          <p className="tiny muted">{t.welcomeBody}</p>
          <p className="tiny">No passwords. No hidden watching. No AI accusations.</p>
        </aside>
      </section>

      <section className="section" id="how-it-works">
        <h2>{e.howTitle}</h2>
        <div className="grid-4">
          {e.how.map((item, index) => (
            <article className="edu-card" key={item.title}>
              <div className="tiny muted">0{index + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{e.youngTitle}</h2>
        <div className="grid-2">
          {e.young.map((item) => (
            <article className="edu-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{e.adultTitle}</h2>
        <div className="grid-2">
          {e.adult.map((item) => (
            <article className="edu-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{e.signsTitle}</h2>
        <div className="grid-2">
          {e.signs.map((item) => (
            <article className="edu-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>{e.urgentTitle}</h2>
        <p className="muted">{e.urgentBody}</p>
        <div className="grid-3">
          {(lines.length ? lines : [
            { id: '116', name: 'Childline Kenya', phone: '116', description: 'Free 24-hour child helpline.' },
            { id: '999', name: 'Emergency', phone: '999 / 112', description: 'If someone is in immediate danger.' },
            { id: '1195', name: 'GBV Helpline', phone: '1195', description: 'Toll-free support after sexual or gender-based harm.' },
          ]).map((item) => (
            <article className="edu-card" key={item.id}>
              <h3>{item.name}</h3>
              {item.phone && <p><b>{item.phone}</b></p>}
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section card">
        <h2>{e.ctaTitle}</h2>
        <p className="muted">{e.ctaBody}</p>
        <div className="actions">
          <a className="btn" href="/role">{t.getStarted}</a>
          <a className="btn secondary" href="/learn">Open the full safety guide</a>
        </div>
      </section>
    </main>
  );
}

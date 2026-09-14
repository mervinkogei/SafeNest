'use client';

import { useEffect, useState } from 'react';
import { currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { education, Lang } from '@/lib/i18n';

export default function LearnPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [back, setBack] = useState('/');
  const e = education[lang];

  useEffect(() => {
    const sync = () => setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
    sync();
    const account = currentUser();
    setBack(account?.role === 'CHILD' ? '/child' : account ? '/parent' : '/');
    window.addEventListener('safenest-lang', sync);
    return () => window.removeEventListener('safenest-lang', sync);
  }, []);

  return (
    <main className="page">
      <BackLink href={back} />
      <div className="kicker">Safety guide</div>
      <h1>Learn before you record an incident</h1>
      <p className="muted" style={{ maxWidth: 720, fontSize: '1.1rem' }}>
        This guide is public. You do not need an account to read it. An account is only for keeping evidence and asking a trusted adult for help.
      </p>

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
        <h2>{e.evidenceTitle}</h2>
        <ol className="steps">
          {e.evidence.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="section card">
        <h2>{e.urgentTitle}</h2>
        <p>In Kenya you can call <b>116</b> (Childline, free, 24 hours). If you are in danger, call <b>999</b> or <b>112</b>. For sexual or gender-based harm, call <b>1195</b>.</p>
        <div className="actions">
          <a className="btn" href="/role">I am ready to record an incident</a>
          <a className="btn secondary" href="/">Back to home</a>
        </div>
      </section>
    </main>
  );
}

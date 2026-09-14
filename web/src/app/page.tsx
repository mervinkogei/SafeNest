'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { copy, education, Lang } from '@/lib/i18n';
import { API_BASE } from '@/lib/api';
import { Icon } from '@/components/Icons';

type Helpline = { id: string; name: string; phone?: string | null; description: string };

const STEP_ICONS = ['book', 'hand', 'spark', 'phone'] as const;
const YOUNG_ICONS = ['heart', 'lock', 'alert', 'shield'];
const ADULT_ICONS = ['users', 'folder', 'chat', 'phone'];
const SIGN_ICONS = ['chat', 'eye', 'alert', 'users'];

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
            <Link className="btn secondary" href="/learn">{t.learnFirst}</Link>
            <Link className="btn" href="/role">{t.getStarted}</Link>
            <button className="btn ghost" type="button" onClick={() => window.dispatchEvent(new Event('safenest-ai-open'))}>
              <Icon name="spark" size={18} /> Ask SafeNest AI
            </button>
          </div>
        </div>
        <aside className="hero-panel ai-hero">
          <div className="hero-art" aria-hidden>
            <span className="orb orb-a" />
            <span className="orb orb-b" />
            <span className="hero-mark"><Icon name="spark" size={32} /></span>
          </div>
          <p className="kicker">Live AI guide</p>
          <h2>Talk with SafeNest, not only analyse later</h2>
          <div className="mini-chat">
            <div className="mini-row user">A group is mocking my daughter. What do I do first?</div>
            <div className="mini-row guide">Stay calm, save the screenshots, and do not reply in the group. I can walk you through recording this — I am AI, not a counsellor. Childline 116 is there if she needs a person now.</div>
          </div>
          <button className="btn" type="button" onClick={() => window.dispatchEvent(new Event('safenest-ai-open'))}>
            Open the AI guide
          </button>
        </aside>
      </section>

      <section className="section" id="how-it-works">
        <div className="section-intro">
          <p className="kicker">Four calm steps</p>
          <h2>{e.howTitle}</h2>
        </div>
        <div className="how-track">
          {e.how.map((item, index) => (
            <article className={`how-card tone-${index}`} key={item.title}>
              <div className="how-visual" aria-hidden>
                <span className="how-num">0{index + 1}</span>
                <Icon name={STEP_ICONS[index]} size={36} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-block">
        <div className="split-art young-art" aria-hidden>
          <span className="blob" />
          <Icon name="heart" size={64} />
        </div>
        <div>
          <p className="kicker">Young people</p>
          <h2>{e.youngTitle}</h2>
          <div className="icon-list">
            {e.young.map((item, index) => (
              <article className="edu-card illustrated" key={item.title}>
                <span className="edu-icon"><Icon name={YOUNG_ICONS[index]} /></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section split-block reverse">
        <div>
          <p className="kicker">Caregivers</p>
          <h2>{e.adultTitle}</h2>
          <div className="icon-list">
            {e.adult.map((item, index) => (
              <article className="edu-card illustrated" key={item.title}>
                <span className="edu-icon"><Icon name={ADULT_ICONS[index]} /></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="split-art adult-art" aria-hidden>
          <span className="blob" />
          <Icon name="users" size={64} />
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <p className="kicker">Watch for</p>
          <h2>{e.signsTitle}</h2>
        </div>
        <div className="sign-grid">
          {e.signs.map((item, index) => (
            <article className="sign-card" key={item.title}>
              <span className="sign-icon"><Icon name={SIGN_ICONS[index]} size={28} /></span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <p className="kicker">People, not only AI</p>
          <h2>{e.urgentTitle}</h2>
          <p className="muted">{e.urgentBody}</p>
        </div>
        <div className="grid-3">
          {(lines.length ? lines : [
            { id: '116', name: 'Childline Kenya', phone: '116', description: 'Free 24-hour child helpline.' },
            { id: '999', name: 'Emergency', phone: '999 / 112', description: 'If someone is in immediate danger.' },
            { id: '1195', name: 'GBV Helpline', phone: '1195', description: 'Toll-free support after sexual or gender-based harm.' },
          ]).map((item) => (
            <article className="edu-card helpline-card" key={item.id}>
              <span className="edu-icon"><Icon name="phone" /></span>
              <h3>{item.name}</h3>
              {item.phone && <p><b>{item.phone}</b></p>}
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-banner">
        <div>
          <h2>{e.ctaTitle}</h2>
          <p className="muted">{e.ctaBody}</p>
        </div>
        <div className="actions">
          <Link className="btn" href="/role">{t.getStarted}</Link>
          <Link className="btn secondary" href="/learn">Open the full safety guide</Link>
        </div>
      </section>
    </main>
  );
}

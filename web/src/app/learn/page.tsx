'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

const STEP_ICONS = ['book', 'hand', 'spark', 'phone'] as const;
const YOUNG_ICONS = ['heart', 'lock', 'alert', 'shield'];
const ADULT_ICONS = ['users', 'folder', 'chat', 'phone'];
const SIGN_ICONS = ['chat', 'eye', 'alert', 'users'];
const EVIDENCE_ICONS = ['eye', 'lock', 'book', 'folder'];

export default function LearnPage() {
  const { t, e } = useLang();
  const [back, setBack] = useState('/');

  useEffect(() => {
    const account = currentUser();
    setBack(account?.role === 'CHILD' ? '/child' : account ? '/parent' : '/');
  }, []);

  return (
    <main className="page learn-page">
      <BackLink href={back} />

      <section className="hero learn-hero">
        <div>
          <p className="kicker">{t.learn.kicker}</p>
          <h1>{t.learn.title}</h1>
          <p className="muted" style={{ fontSize: '1.12rem', lineHeight: 1.55 }}>{t.learn.intro}</p>
          <div className="learn-jumps">
            <a href="#young"><Icon name="heart" size={16} /> {t.learn.jumpYoung}</a>
            <a href="#adults"><Icon name="users" size={16} /> {t.learn.jumpAdults}</a>
            <a href="#signs"><Icon name="alert" size={16} /> {t.learn.jumpSigns}</a>
            <a href="#evidence"><Icon name="folder" size={16} /> {t.learn.jumpEvidence}</a>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={() => window.dispatchEvent(new Event('safenest-ai-open'))}>
              <Icon name="spark" size={18} /> {t.home.askAi}
            </button>
            <Link className="btn secondary" href="/role">{t.learn.ready}</Link>
          </div>
        </div>
        <aside className="learn-hero-art" aria-hidden>
          <span className="learn-ring r1" />
          <span className="learn-ring r2" />
          <span className="learn-ring r3" />
          <div className="learn-phone">
            <div className="learn-phone-screen">
              <span className="learn-chip-row">SafeNest</span>
              <span className="learn-msg left" />
              <span className="learn-msg right" />
              <span className="learn-msg left short" />
            </div>
          </div>
          <span className="learn-float f1"><Icon name="shield" size={22} /></span>
          <span className="learn-float f2"><Icon name="lock" size={18} /></span>
          <span className="learn-float f3"><Icon name="heart" size={18} /></span>
        </aside>
      </section>

      <section className="section">
        <div className="section-intro">
          <p className="kicker">{t.learn.startHere}</p>
          <h2>{e.howTitle}</h2>
        </div>
        <div className="how-track">
          {e.how.map((item, index) => (
            <article className={`how-card tone-${index}`} key={item.title}>
              <div className="how-visual">
                <span className="how-num">0{index + 1}</span>
                <Icon name={STEP_ICONS[index]} size={36} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-block" id="young">
        <div className="split-art young-art" aria-hidden>
          <span className="blob" />
          <span className="learn-scene-icons">
            <Icon name="heart" size={56} />
            <span className="learn-scene-mini"><Icon name="lock" size={22} /></span>
          </span>
        </div>
        <div>
          <p className="kicker">{t.home.youngPeople}</p>
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

      <section className="section split-block reverse" id="adults">
        <div>
          <p className="kicker">{t.home.caregivers}</p>
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
          <span className="learn-scene-icons">
            <Icon name="users" size={56} />
            <span className="learn-scene-mini"><Icon name="shield" size={22} /></span>
          </span>
        </div>
      </section>

      <section className="section" id="signs">
        <div className="section-intro">
          <p className="kicker">{t.home.watchFor}</p>
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

      <section className="section" id="evidence">
        <div className="section-intro">
          <p className="kicker">{t.learn.calmRecord}</p>
          <h2>{e.evidenceTitle}</h2>
        </div>
        <div className="how-track">
          {e.evidence.map((step, index) => (
            <article className={`how-card tone-${index}`} key={step}>
              <div className="how-visual">
                <span className="how-num">0{index + 1}</span>
                <Icon name={EVIDENCE_ICONS[index]} size={36} />
              </div>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-intro">
          <p className="kicker">{t.home.peopleNotAi}</p>
          <h2>{e.urgentTitle}</h2>
        </div>
        <div className="grid-3">
          {[
            { icon: 'phone', title: t.home.childline, phone: '116', body: t.learn.helpline116 },
            { icon: 'alert', title: t.home.emergency, phone: '999 / 112', body: t.learn.helpline999 },
            { icon: 'heart', title: t.home.gbv, phone: '1195', body: t.learn.helpline1195 },
          ].map((item) => (
            <article className="edu-card helpline-card" key={item.phone}>
              <span className="edu-icon"><Icon name={item.icon} /></span>
              <div>
                <h3>{item.title}</h3>
                <p><b>{item.phone}</b></p>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section cta-banner">
        <div>
          <h2>{t.learn.ctaTitle}</h2>
          <p className="muted">{t.learn.ctaBody}</p>
        </div>
        <div className="actions">
          <Link className="btn" href="/role">{t.learn.readyIncident}</Link>
          <Link className="btn secondary" href="/">{t.learn.backHome}</Link>
        </div>
      </section>
    </main>
  );
}

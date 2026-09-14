'use client';

import { useEffect, useState } from 'react';
import { api, clearSession, currentUser } from '@/lib/api';
import { copy, Lang } from '@/lib/i18n';

export default function ChildHome() {
  const [lang, setLang] = useState<Lang>('en');
  const t = copy[lang];
  const user = currentUser();

  useEffect(() => {
    setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
    if (!currentUser()) window.location.href = '/login';
  }, []);

  async function start(category: string) {
    const children = await api('/children');
    const childId = children[0]?.id;
    const incident = await api('/incidents', {
      method: 'POST',
      body: JSON.stringify({
        childId,
        category,
        platform: 'WhatsApp',
        description: category === 'worried' ? 'I am worried about something online.' : '',
      }),
    });
    window.location.href = `/report/${incident.id}/evidence`;
  }

  return (
    <main className="screen">
      <div className="topbar">
        <h2 style={{ margin: 0 }}>Hi {user?.name || ''} 👋</h2>
        <button className="lang" onClick={() => { clearSession(); window.location.href = '/'; }}>Sign out</button>
      </div>
      <p>{t.okayOnline}</p>
      <button className="choice" onClick={() => start('unsure')}>
        <b>{t.askHelp}</b>
        <span className="tiny muted">You will not get in trouble for telling us.</span>
      </button>
      <button className="choice" onClick={() => start('worried')}>
        <b>{t.worried}</b>
        <span className="tiny muted">A trusted adult can look with you.</span>
      </button>
      <a className="choice" href="/learn">
        <b>{t.learn}</b>
        <span className="tiny muted">Short, kind guidance. No scary language.</span>
      </a>
    </main>
  );
}

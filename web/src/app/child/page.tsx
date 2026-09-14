'use client';

import { useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import { copy, Lang } from '@/lib/i18n';

export default function ChildHome() {
  const [lang, setLang] = useState<Lang>('en');
  const [user, setUser] = useState<{ name?: string } | null>(null);
  const t = copy[lang];

  useEffect(() => {
    setLang((localStorage.getItem('safenest_lang') as Lang) || 'en');
    const account = currentUser();
    if (!account) {
      window.location.href = '/login';
      return;
    }
    setUser(account);
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
    <main className="page">
      <h2 style={{ margin: 0 }}>Hi {user?.name || ''} 👋</h2>
      <p>{t.okayOnline}</p>
      <div className="grid-2" style={{ marginTop: 16 }}>
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
      </div>
    </main>
  );
}

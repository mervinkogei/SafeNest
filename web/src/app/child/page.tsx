'use client';

import { useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import { useLang } from '@/lib/language';

export default function ChildHome() {
  const { t } = useLang();
  const [user, setUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
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
        description: category === 'worried' ? t.copy.worried : '',
      }),
    });
    window.location.href = `/report/${incident.id}/evidence`;
  }

  return (
    <main className="page">
      <h2 style={{ margin: 0 }}>{t.child.hi} {user?.name || ''} 👋</h2>
      <p>{t.copy.okayOnline}</p>
      <div className="grid-2" style={{ marginTop: 16 }}>
      <button className="choice" onClick={() => start('unsure')}>
        <b>{t.copy.askHelp}</b>
        <span className="tiny muted">{t.child.noTrouble}</span>
      </button>
      <button className="choice" onClick={() => start('worried')}>
        <b>{t.copy.worried}</b>
        <span className="tiny muted">{t.child.adultLook}</span>
      </button>
      <a className="choice" href="/learn">
        <b>{t.copy.learn}</b>
        <span className="tiny muted">{t.child.kindGuide}</span>
      </a>
      </div>
    </main>
  );
}

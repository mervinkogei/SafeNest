'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';

const OPTIONS = [
  { id: 'bullying', label: 'Someone is bullying me' },
  { id: 'threatened', label: 'Someone threatened me' },
  { id: 'uncomfortable', label: 'Someone made me uncomfortable' },
  { id: 'private', label: 'Someone asked for something private' },
  { id: 'unsure', label: "I'm not sure" },
  { id: 'other', label: 'Other' },
];

export default function ReportPage() {
  const [children, setChildren] = useState<Array<{ id: string; displayName: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/children').then(setChildren).catch(() => setChildren([]));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const user = currentUser();
      const incident = await api('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          category: form.get('category'),
          childId: form.get('childId') || undefined,
          platform: 'WhatsApp',
          description: '',
        }),
      });
      window.location.href = `/report/${incident.id}/evidence`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start incident');
    }
  }

  return (
    <main className="page">
      <div className="form-card" style={{ width: 'min(640px, 100%)' }}>
      <a className="tiny muted" href={currentUser()?.role === 'CHILD' ? '/child' : '/parent'}>← Back</a>
      <h1>What happened?</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        {currentUser()?.role === 'PARENT' && (
          <label className="field">For which child?
            <select name="childId" required={children.length > 0}>
              {children.map((child) => (
                <option key={child.id} value={child.id}>{child.displayName}</option>
              ))}
            </select>
          </label>
        )}
        {OPTIONS.map((option) => (
          <label className="option" key={option.id}>
            <input type="radio" name="category" value={option.id} required />
            <span>{option.label}</span>
          </label>
        ))}
        {error && <div className="error">{error}</div>}
        <button className="btn">Continue</button>
      </form>
      </div>
    </main>
  );
}

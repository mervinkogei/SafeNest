'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Child = { id: string; displayName: string; ageRange: string; inviteCode: string };

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState('');

  function load() {
    api('/children').then(setChildren);
  }
  useEffect(load, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api('/children', {
        method: 'POST',
        body: JSON.stringify({ displayName: form.get('displayName'), ageRange: form.get('ageRange') }),
      });
      (event.target as HTMLFormElement).reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add profile');
    }
  }

  return (
    <main className="screen">
      <a className="tiny muted" href="/parent">← Dashboard</a>
      <h1>Child profiles</h1>
      <p className="tiny muted">Only a display name, age range, and invite code. No school, location, or extra identity data.</p>
      {children.map((child) => (
        <div className="card" key={child.id}>
          <b>{child.displayName}</b>
          <p className="tiny muted">Age range {child.ageRange}</p>
          <p>Invite code <b>{child.inviteCode}</b></p>
        </div>
      ))}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
        <label className="field">Display name
          <input name="displayName" required />
        </label>
        <label className="field">Age range
          <select name="ageRange">
            <option>8-12</option>
            <option>13-15</option>
            <option>16-17</option>
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn">Add child profile</button>
      </form>
    </main>
  );
}

'use client';

import { FormEvent, useMemo, useState } from 'react';
import { api, setSession } from '@/lib/api';

export default function RegisterPage() {
  const role = useMemo(() => {
    if (typeof window === 'undefined') return 'PARENT';
    return new URLSearchParams(window.location.search).get('role') || localStorage.getItem('safenest_role') || 'PARENT';
  }, []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          role,
          inviteCode: form.get('inviteCode') || undefined,
        }),
      });
      setSession(data.token, data.user);
      window.location.href = role === 'CHILD' ? '/child' : '/parent';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen">
      <a className="tiny muted" href="/role">← Back</a>
      <h1>Create your SafeNest</h1>
      <p className="muted tiny">We only ask for a name and email. Children never share social-media passwords.</p>
      <form onSubmit={onSubmit} className="grow" style={{ display: 'grid', gap: 12 }}>
        <label className="field">Name
          <input name="name" required placeholder={role === 'CHILD' ? 'A name you like' : 'Your name'} />
        </label>
        <label className="field">Email
          <input name="email" type="email" required placeholder="you@email.com" />
        </label>
        <label className="field">Password
          <input name="password" type="password" minLength={8} required placeholder="At least 8 characters" />
        </label>
        {role === 'CHILD' && (
          <label className="field">Family invite code
            <input name="inviteCode" placeholder="NEST42" />
          </label>
        )}
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>{loading ? 'Saving…' : 'Continue'}</button>
      </form>
    </main>
  );
}

'use client';

import { FormEvent, useState } from 'react';
import { api, setSession } from '@/lib/api';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      setSession(data.token, data.user);
      window.location.href = data.user.role === 'CHILD' ? '/child' : '/parent';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="screen">
      <a className="tiny muted" href="/">← Back</a>
      <h1>Welcome back</h1>
      <p className="muted tiny">Demo: amani@safenest.ke or kito@safenest.ke / Safeguard123</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label className="field">Email
          <input name="email" type="email" required />
        </label>
        <label className="field">Password
          <input name="password" type="password" required />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

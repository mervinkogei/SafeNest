'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api, setSession } from '@/lib/api';
import BackLink from '@/components/BackLink';
import PasswordField from '@/components/PasswordField';

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
    <main className="page">
      <div className="form-card">
        <BackLink href="/" label="Home" />
        <h1>Welcome back</h1>
        <p className="muted tiny">Demo: amani@safenest.ke or kito@safenest.ke / Safeguard123</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label className="field">Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <PasswordField name="password" required autoComplete="current-password" />
          <p className="auth-links">
            <Link href="/forgot-password">Forgot password?</Link>
            <Link href="/role">Create an account</Link>
          </p>
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    </main>
  );
}

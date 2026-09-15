'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, setSession } from '@/lib/api';
import BackLink from '@/components/BackLink';
import PasswordField from '@/components/PasswordField';
import { useLang } from '@/lib/language';

export default function RegisterPage() {
  const { t } = useLang();
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
      setError(err instanceof Error ? err.message : t.auth.createFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="form-card">
        <BackLink href="/role" />
        <h1>{t.auth.createTitle}</h1>
        <p className="muted tiny">{t.auth.createHint}</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label className="field">{t.common.name}
            <input name="name" required placeholder={role === 'CHILD' ? t.auth.nameChild : t.auth.nameAdult} />
          </label>
          <label className="field">{t.common.email}
            <input name="email" type="email" required placeholder="you@email.com" autoComplete="email" />
          </label>
          <PasswordField name="password" required minLength={8} placeholder={t.auth.passwordHint} autoComplete="new-password" />
          {role === 'CHILD' && (
            <label className="field">{t.auth.invite}
              <input name="inviteCode" placeholder="NEST42" />
            </label>
          )}
          {error && <div className="error">{error}</div>}
          <button className="btn" disabled={loading}>{loading ? t.auth.saving : t.common.continue}</button>
        </form>
        <p className="auth-links">
          <Link href="/login">{t.auth.haveAccount}</Link>
        </p>
      </div>
    </main>
  );
}

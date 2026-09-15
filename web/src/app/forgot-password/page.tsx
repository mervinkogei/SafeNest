'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import PasswordField from '@/components/PasswordField';
import { useLang } from '@/lib/language';

export default function ForgotPasswordPage() {
  const { t } = useLang();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get('email') || '');
    try {
      const data = await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: nextEmail }),
      });
      setEmail(nextEmail);
      setDemoCode(data.demoCode || '');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.resetFail);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const data = await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          code: form.get('code'),
          password: form.get('password'),
        }),
      });
      setDone(data.message || t.auth.updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.updateFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="form-card">
        <BackLink href="/login" label={t.auth.signIn} />
        <h1>{t.auth.forgotTitle}</h1>
        {done ? (
          <>
            <p className="muted">{done}</p>
            <Link className="btn" href="/login">{t.auth.backSignIn}</Link>
          </>
        ) : step === 'email' ? (
          <>
            <p className="muted tiny">{t.auth.forgotHint}</p>
            <form onSubmit={requestCode} style={{ display: 'grid', gap: 12 }}>
              <label className="field">{t.common.email}
                <input name="email" type="email" required autoComplete="email" />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="btn" disabled={loading}>{loading ? t.auth.checking : t.auth.sendCode}</button>
            </form>
          </>
        ) : (
          <>
            <p className="muted tiny">{t.auth.enterCode}</p>
            {demoCode && (
              <p className="notice-inline">{t.auth.demoCode} {email}: <b>{demoCode}</b></p>
            )}
            <form onSubmit={resetPassword} style={{ display: 'grid', gap: 12 }}>
              <label className="field">{t.auth.resetCode}
                <input name="code" inputMode="numeric" required minLength={4} placeholder={t.auth.codePlaceholder} />
              </label>
              <PasswordField name="password" required minLength={8} placeholder={t.auth.passwordHint} autoComplete="new-password" />
              {error && <div className="error">{error}</div>}
              <button className="btn" disabled={loading}>{loading ? t.auth.saving : t.auth.updatePassword}</button>
            </form>
          </>
        )}
        <p className="auth-links">
          <Link href="/login">{t.auth.remembered}</Link>
          <Link href="/role">{t.auth.createAccount}</Link>
        </p>
      </div>
    </main>
  );
}

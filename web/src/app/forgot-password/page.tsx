'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import PasswordField from '@/components/PasswordField';

export default function ForgotPasswordPage() {
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
      setError(err instanceof Error ? err.message : 'Could not start a reset');
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
      setDone(data.message || 'Password updated. You can sign in now.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="form-card">
        <BackLink href="/login" label="Sign in" />
        <h1>Forgot password</h1>
        {done ? (
          <>
            <p className="muted">{done}</p>
            <Link className="btn" href="/login">Back to sign in</Link>
          </>
        ) : step === 'email' ? (
          <>
            <p className="muted tiny">Enter the email on your SafeNest account. We will give you a short code to set a new password.</p>
            <form onSubmit={requestCode} style={{ display: 'grid', gap: 12 }}>
              <label className="field">Email
                <input name="email" type="email" required autoComplete="email" />
              </label>
              {error && <div className="error">{error}</div>}
              <button className="btn" disabled={loading}>{loading ? 'Checking…' : 'Send reset code'}</button>
            </form>
          </>
        ) : (
          <>
            <p className="muted tiny">Enter the 6-digit code and choose a new password.</p>
            {demoCode && (
              <p className="notice-inline">Demo reset code for {email}: <b>{demoCode}</b></p>
            )}
            <form onSubmit={resetPassword} style={{ display: 'grid', gap: 12 }}>
              <label className="field">Reset code
                <input name="code" inputMode="numeric" required minLength={4} placeholder="6-digit code" />
              </label>
              <PasswordField name="password" required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" />
              {error && <div className="error">{error}</div>}
              <button className="btn" disabled={loading}>{loading ? 'Saving…' : 'Update password'}</button>
            </form>
          </>
        )}
        <p className="auth-links">
          <Link href="/login">Remembered it? Sign in</Link>
          <Link href="/role">Create an account</Link>
        </p>
      </div>
    </main>
  );
}

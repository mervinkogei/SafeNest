'use client';

import { useEffect, useState } from 'react';
import { currentUser, clearSession } from '@/lib/api';

export default function SiteHeader() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setUser(currentUser());
    setLang(localStorage.getItem('safenest_lang') || 'en');
  }, []);

  function toggleLang() {
    const next = lang === 'en' ? 'sw' : 'en';
    setLang(next);
    localStorage.setItem('safenest_lang', next);
    window.dispatchEvent(new Event('safenest-lang'));
  }

  const home = user?.role === 'CHILD' ? '/child' : user ? '/parent' : '/';

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a className="brand-link" href={home}>
          <span className="brand-mark" aria-hidden>🛡️</span>
          <span className="brand">SafeNest</span>
        </a>
        <nav className="site-nav">
          <a href="/learn">Learn</a>
          {!user && <a href="/#how-it-works">How it works</a>}
          {user?.role === 'PARENT' && <a href="/parent">Dashboard</a>}
          {user?.role === 'PARENT' && <a href="/report">Report</a>}
          {user?.role === 'CHILD' && <a href="/child">Home</a>}
          {user && <a href="/resources">Help lines</a>}
          <button className="lang" type="button" onClick={toggleLang}>
            {lang === 'en' ? 'Kiswahili' : 'English'}
          </button>
          {user ? (
            <button className="lang" type="button" onClick={() => { clearSession(); window.location.href = '/'; }}>
              Sign out
            </button>
          ) : (
            <>
              <a href="/login">Sign in</a>
              <a className="btn header-cta" href="/role">Get started</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

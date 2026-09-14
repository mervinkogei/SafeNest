'use client';

import { useEffect, useState } from 'react';
import { currentUser, clearSession } from '@/lib/api';
import { Icon } from '@/components/Icons';

export default function SiteHeader() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);

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

  const links = [
    { href: '/learn', label: 'Learn', icon: 'book' },
    ...(!user ? [{ href: '/#how-it-works', label: 'How it works', icon: 'shield' }] : []),
    ...(user?.role === 'PARENT' ? [
      { href: '/parent', label: 'Dashboard', icon: 'home' },
      { href: '/report', label: 'Report', icon: 'plus' },
      { href: '/locker', label: 'Locker', icon: 'folder' },
      { href: '/resources', label: 'Help lines', icon: 'phone' },
    ] : []),
    ...(user?.role === 'CHILD' ? [
      { href: '/child', label: 'Home', icon: 'home' },
      { href: '/resources', label: 'Help lines', icon: 'phone' },
    ] : []),
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-link" href={home}>
            <span className="brand-mark" aria-hidden><Icon name="shield" size={18} /></span>
            <span className="brand">SafeNest</span>
          </a>
          <nav className="site-nav desktop-nav">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                <Icon name={link.icon} size={16} />
                {link.label}
              </a>
            ))}
            <button className="icon-chip" type="button" onClick={toggleLang} aria-label="Change language">
              <Icon name="globe" size={16} />
              <span>{lang === 'en' ? 'SW' : 'EN'}</span>
            </button>
            {user ? (
              <button className="icon-chip" type="button" onClick={() => { clearSession(); window.location.href = '/'; }}>
                <Icon name="logout" size={16} />
                <span>Sign out</span>
              </button>
            ) : (
              <>
                <a className="nav-link" href="/login">Sign in</a>
                <a className="btn header-cta" href="/role">Get started</a>
              </>
            )}
          </nav>
          <button className="menu-toggle" type="button" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      {open && (
        <div className="menu-drawer" role="dialog" aria-label="Menu">
          <div className="menu-drawer-head">
            <strong>Menu</strong>
            <button className="menu-toggle" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          {links.map((link) => (
            <a key={link.href} href={link.href} className="drawer-link" onClick={() => setOpen(false)}>
              <span className="drawer-icon"><Icon name={link.icon} /></span>
              {link.label}
            </a>
          ))}
          <button className="drawer-link" type="button" onClick={toggleLang}>
            <span className="drawer-icon"><Icon name="globe" /></span>
            {lang === 'en' ? 'Kiswahili' : 'English'}
          </button>
          {user ? (
            <button className="drawer-link" type="button" onClick={() => { clearSession(); window.location.href = '/'; }}>
              <span className="drawer-icon"><Icon name="logout" /></span>
              Sign out
            </button>
          ) : (
            <>
              <a className="drawer-link" href="/login" onClick={() => setOpen(false)}>Sign in</a>
              <a className="btn" href="/role" onClick={() => setOpen(false)}>Get started</a>
            </>
          )}
        </div>
      )}

      {user && (
        <nav className="mobile-tabs" aria-label="Primary">
          <a href={home}><Icon name="home" /><span>Home</span></a>
          {user.role === 'PARENT' && <a href="/report"><Icon name="plus" /><span>Report</span></a>}
          {user.role === 'CHILD' && <a href="/report"><Icon name="plus" /><span>Help</span></a>}
          <a href="/learn"><Icon name="book" /><span>Learn</span></a>
          <a href="/resources"><Icon name="phone" /><span>Help</span></a>
        </nav>
      )}
    </>
  );
}

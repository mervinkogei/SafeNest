'use client';

import { useEffect, useState } from 'react';
import { currentUser, clearSession } from '@/lib/api';
import { Icon } from '@/components/Icons';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function SiteHeader() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    setUser(currentUser());
    setLang(localStorage.getItem('safenest_lang') || 'en');
    setReady(true);
    const closeMenuOnDesktop = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener('resize', closeMenuOnDesktop);
    return () => window.removeEventListener('resize', closeMenuOnDesktop);
  }, []);

  function toggleLang() {
    const next = lang === 'en' ? 'sw' : 'en';
    setLang(next);
    localStorage.setItem('safenest_lang', next);
    window.dispatchEvent(new Event('safenest-lang'));
  }

  function logout() {
    clearSession();
    window.location.href = '/';
  }

  const home = user?.role === 'CHILD' ? '/child' : user ? '/parent' : '/';

  const links = !ready ? [] : [
    { href: '/learn', label: 'Learn', icon: 'book' },
    ...(!user ? [{ href: '/#how-it-works', label: 'How it works', icon: 'shield' }] : []),
    ...(user?.role === 'PARENT' ? [
      { href: '/parent', label: 'Home', icon: 'home' },
      { href: '/report', label: 'Report', icon: 'plus' },
      { href: '/locker', label: 'Locker', icon: 'folder' },
      { href: '/resources', label: 'Help', icon: 'phone' },
    ] : []),
    ...(user?.role === 'CHILD' ? [
      { href: '/child', label: 'Home', icon: 'home' },
      { href: '/resources', label: 'Help', icon: 'phone' },
    ] : []),
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand-link" href={home}>
            <span className="brand-mark" aria-hidden><Icon name="shield" size={16} /></span>
            <span className="brand">SafeNest</span>
          </a>
          <nav className={`site-nav desktop-nav ${ready ? 'is-ready' : ''}`} aria-busy={!ready}>
            {links.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                <Icon name={link.icon} size={16} />
                {link.label}
              </a>
            ))}
            {ready && (
              <>
                <button className="icon-chip" type="button" onClick={toggleLang} aria-label="Change language">
                  <Icon name="globe" size={16} />
                  <span>{lang === 'en' ? 'SW' : 'EN'}</span>
                </button>
                {user ? (
                  <button className="icon-chip" type="button" onClick={() => setLogoutOpen(true)}>
                    <Icon name="logout" size={16} />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <>
                    <a className="nav-link" href="/login">Sign in</a>
                    <a className="btn header-cta" href="/role">Get started</a>
                  </>
                )}
              </>
            )}
          </nav>
          <button className="menu-toggle" type="button" aria-label="Open menu" onClick={() => setOpen((value) => !value)}>
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </header>

      {open && (
        <>
          <button className="menu-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav className="menu-sheet" aria-label="Menu">
            <div className="menu-grid">
              {links.map((link) => (
                <a key={link.href} href={link.href} className="menu-item" onClick={() => setOpen(false)}>
                  <Icon name={link.icon} size={18} />
                  <span>{link.label}</span>
                </a>
              ))}
              <button className="menu-item" type="button" onClick={toggleLang}>
                <Icon name="globe" size={18} />
                <span>{lang === 'en' ? 'SW' : 'EN'}</span>
              </button>
              {user ? (
                <button className="menu-item" type="button" onClick={() => { setOpen(false); setLogoutOpen(true); }}>
                  <Icon name="logout" size={18} />
                  <span>Out</span>
                </button>
              ) : (
                <a className="menu-item" href="/login" onClick={() => setOpen(false)}>
                  <Icon name="users" size={18} />
                  <span>Sign in</span>
                </a>
              )}
            </div>
          </nav>
        </>
      )}

      {user && (
        <nav className="mobile-tabs" aria-label="Primary">
          <a href={home}><Icon name="home" size={20} /><span>Home</span></a>
          <a href="/report"><Icon name="plus" size={20} /><span>{user.role === 'PARENT' ? 'Report' : 'Help'}</span></a>
          <a href="/learn"><Icon name="book" size={20} /><span>Learn</span></a>
          <a href="/resources"><Icon name="phone" size={20} /><span>Help</span></a>
        </nav>
      )}

      <ConfirmDialog
        open={logoutOpen}
        title="Sign out?"
        body="You will need to sign in again to view incidents, evidence, or ask for help."
        confirmLabel="Sign out"
        danger
        onCancel={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}

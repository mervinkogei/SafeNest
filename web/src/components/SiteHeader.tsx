'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { clearSession } from '@/lib/api';
import { Icon } from '@/components/Icons';
import ConfirmDialog from '@/components/ConfirmDialog';

function subscribeSession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('safenest-session', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('safenest-session', onStoreChange);
  };
}

function readUserJson() {
  return localStorage.getItem('safenest_user');
}

const LINKS = [
  { href: '/learn', label: 'Learn', icon: 'book' },
  { href: '/#how-it-works', label: 'How it works', icon: 'shield' },
  { href: '/report', label: 'Report', icon: 'plus' },
  { href: '/locker', label: 'Locker', icon: 'folder' },
  { href: '/resources', label: 'Help', icon: 'phone' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribeSession, readUserJson, () => null);
  const user = raw ? JSON.parse(raw) as { name?: string; role?: string } : null;
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    setLang(localStorage.getItem('safenest_lang') || 'en');
    const closeMenuOnDesktop = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener('resize', closeMenuOnDesktop);
    return () => window.removeEventListener('resize', closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  function openGuide() {
    setOpen(false);
    window.dispatchEvent(new Event('safenest-ai-open'));
  }

  const home = user?.role === 'CHILD' ? '/child' : user ? '/parent' : '/';

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand-link" href={home}>
            <span className="brand-mark" aria-hidden><Icon name="shield" size={16} /></span>
            <span className="brand">SafeNest</span>
          </Link>
          <nav className="site-nav desktop-nav">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                <Icon name={link.icon} size={16} />
                {link.label}
              </Link>
            ))}
            <button className="nav-link" type="button" onClick={openGuide}>
              <Icon name="spark" size={16} />
              Ask AI
            </button>
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
                <Link className="nav-link" href="/login">Sign in</Link>
                <Link className="btn header-cta" href="/role">Get started</Link>
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
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="menu-item" onClick={() => setOpen(false)}>
                  <Icon name={link.icon} size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              <button className="menu-item" type="button" onClick={openGuide}>
                <Icon name="spark" size={18} />
                <span>Ask AI</span>
              </button>
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
                <Link className="menu-item" href="/login" onClick={() => setOpen(false)}>
                  <Icon name="users" size={18} />
                  <span>Sign in</span>
                </Link>
              )}
            </div>
          </nav>
        </>
      )}

      {user && (
        <nav className="mobile-tabs" aria-label="Primary">
          <Link href={home}><Icon name="home" size={20} /><span>Home</span></Link>
          <Link href="/report"><Icon name="plus" size={20} /><span>Report</span></Link>
          <Link href="/learn"><Icon name="book" size={20} /><span>Learn</span></Link>
          <button type="button" onClick={openGuide}><Icon name="spark" size={20} /><span>Ask AI</span></button>
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

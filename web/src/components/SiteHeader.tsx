'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { clearSession } from '@/lib/api';
import { Icon } from '@/components/Icons';
import ConfirmDialog from '@/components/ConfirmDialog';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLang } from '@/lib/language';

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

export default function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLang();
  const raw = useSyncExternalStore(subscribeSession, readUserJson, () => null);
  const user = raw ? JSON.parse(raw) as { name?: string; role?: string } : null;
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    const closeMenuOnDesktop = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener('resize', closeMenuOnDesktop);
    return () => window.removeEventListener('resize', closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function logout() {
    clearSession();
    window.location.href = '/';
  }

  function openGuide() {
    setOpen(false);
    window.dispatchEvent(new Event('safenest-ai-open'));
  }

  const home = user?.role === 'CHILD' ? '/child' : user ? '/parent' : '/';
  const links = [
    { href: '/learn', label: t.nav.learn, icon: 'book' },
    { href: '/#how-it-works', label: t.nav.how, icon: 'shield' },
    { href: '/report', label: t.nav.report, icon: 'plus' },
    { href: '/locker', label: t.nav.locker, icon: 'folder' },
    { href: '/resources', label: t.nav.help, icon: 'phone' },
  ];

  return (
    <>
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="brand-link" href={home}>
            <span className="brand-mark" aria-hidden><Icon name="shield" size={16} /></span>
            <span className="brand">SafeNest</span>
          </Link>
          <nav className="site-nav desktop-nav">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link">
                <Icon name={link.icon} size={16} />
                {link.label}
              </Link>
            ))}
            <button className="nav-link" type="button" onClick={openGuide}>
              <Icon name="spark" size={16} />
              {t.nav.askAi}
            </button>
            <LanguageSwitcher />
            {user ? (
              <button className="icon-chip" type="button" onClick={() => setLogoutOpen(true)}>
                <Icon name="logout" size={16} />
                <span>{t.nav.signOut}</span>
              </button>
            ) : (
              <>
                <Link className="nav-link" href="/login">{t.nav.signIn}</Link>
                <Link className="btn header-cta" href="/role">{t.nav.getStarted}</Link>
              </>
            )}
          </nav>
          <div className="header-mobile-tools">
            <LanguageSwitcher compact />
            <button className="menu-toggle" type="button" aria-label={t.nav.openMenu} onClick={() => setOpen((value) => !value)}>
              <Icon name={open ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <>
          <button className="menu-backdrop" aria-label={t.nav.closeMenu} onClick={() => setOpen(false)} />
          <nav className="menu-sheet" aria-label={t.nav.openMenu}>
            <div className="menu-grid">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="menu-item" onClick={() => setOpen(false)}>
                  <Icon name={link.icon} size={18} />
                  <span>{link.label}</span>
                </Link>
              ))}
              <button className="menu-item" type="button" onClick={openGuide}>
                <Icon name="spark" size={18} />
                <span>{t.nav.askAi}</span>
              </button>
              {user ? (
                <button className="menu-item" type="button" onClick={() => { setOpen(false); setLogoutOpen(true); }}>
                  <Icon name="logout" size={18} />
                  <span>{t.nav.signOut}</span>
                </button>
              ) : (
                <Link className="menu-item" href="/login" onClick={() => setOpen(false)}>
                  <Icon name="users" size={18} />
                  <span>{t.nav.signIn}</span>
                </Link>
              )}
            </div>
          </nav>
        </>
      )}

      {user && (
        <nav className="mobile-tabs" aria-label={t.nav.home}>
          <Link href={home}><Icon name="home" size={20} /><span>{t.nav.home}</span></Link>
          <Link href="/report"><Icon name="plus" size={20} /><span>{t.nav.report}</span></Link>
          <Link href="/learn"><Icon name="book" size={20} /><span>{t.nav.learn}</span></Link>
          <button type="button" onClick={openGuide}><Icon name="spark" size={20} /><span>{t.nav.askAi}</span></button>
        </nav>
      )}

      <ConfirmDialog
        open={logoutOpen}
        title={t.nav.logoutTitle}
        body={t.nav.logoutBody}
        confirmLabel={t.nav.signOut}
        danger
        onCancel={() => setLogoutOpen(false)}
        onConfirm={logout}
      />
    </>
  );
}

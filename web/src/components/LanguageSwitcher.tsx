'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGUAGES } from '@/lib/i18n';
import { useLang } from '@/lib/language';

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((item) => item.id === lang) || LANGUAGES[0];

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={`lang-switch ${compact ? 'compact' : ''}`} ref={root}>
      <button
        className="lang-btn"
        type="button"
        aria-label={t.nav.language}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="lang-flag" aria-hidden>{current.flag}</span>
        {!compact && <span className="lang-code">{current.id.toUpperCase()}</span>}
        <span className="lang-caret" aria-hidden />
      </button>
      {open && (
        <ul className="lang-menu" role="listbox" aria-label={t.nav.language}>
          {LANGUAGES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === lang}
                className={item.id === lang ? 'active' : ''}
                onClick={() => {
                  setLang(item.id);
                  setOpen(false);
                }}
              >
                <span className="lang-flag" aria-hidden>{item.flag}</span>
                <span>{item.native}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

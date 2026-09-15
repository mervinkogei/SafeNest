'use client';

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Lang, parseLang, ui, education } from '@/lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof ui)['en'];
  e: (typeof education)['en'];
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const next = parseLang(localStorage.getItem('safenest_lang'));
    setLangState(next);
    document.documentElement.lang = next;
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem('safenest_lang', next);
    document.documentElement.lang = next;
    window.dispatchEvent(new Event('safenest-lang'));
  }

  const value = useMemo(
    () => ({ lang, setLang, t: ui[lang], e: education[lang] }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}

'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

type ChatMsg = { role: 'user' | 'guide'; text: string; urgent?: boolean; actions?: Array<{ label: string; href: string }> };

export default function AiGuide() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((current) => {
      if (current.length > 1) return current;
      return [{
        role: 'guide',
        text: t.ai.welcome,
        actions: [
          { label: t.ai.learn, href: '/learn' },
          { label: t.ai.report, href: '/report' },
          { label: t.ai.help, href: '/resources' },
        ],
      }];
    });
  }, [lang, t]);

  useEffect(() => {
    const openChat = (event: Event) => {
      setOpen(true);
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      if (detail?.prompt) setInput(detail.prompt);
    };
    window.addEventListener('safenest-ai-open', openChat as EventListener);
    return () => window.removeEventListener('safenest-ai-open', openChat as EventListener);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: message }]);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/ai/guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setMessages((current) => [...current, {
        role: 'guide',
        text: data.reply || t.ai.fallback,
        urgent: data.urgent,
        actions: data.actions,
      }]);
    } catch {
      setMessages((current) => [...current, {
        role: 'guide',
        text: t.ai.offline,
        urgent: true,
      }]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    send(input);
  }

  return (
    <>
      {!open && (
        <button className="ai-fab" type="button" onClick={() => setOpen(true)}>
          <Icon name="spark" size={22} />
          <span>{t.ai.fab}</span>
        </button>
      )}
      {open && (
        <section className="ai-panel" aria-label={t.ai.title}>
          <header className="ai-panel-head">
            <div>
              <b>{t.ai.title}</b>
              <p className="tiny">{t.ai.subtitle}</p>
            </div>
            <button className="icon-chip" type="button" aria-label={t.ai.close} onClick={() => setOpen(false)}>
              <Icon name="close" size={16} />
            </button>
          </header>
          <div className="ai-thread" ref={scroller}>
            {messages.map((item, index) => (
              <div className={`ai-bubble ${item.role} ${item.urgent ? 'urgent' : ''}`} key={`${item.role}-${index}`}>
                <p>{item.text}</p>
                {item.actions && (
                  <div className="ai-actions">
                    {item.actions.map((action) => (
                      action.href.startsWith('tel:')
                        ? <a key={action.href + action.label} href={action.href}>{action.label}</a>
                        : <Link key={action.href + action.label} href={action.href} onClick={() => setOpen(false)}>{action.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && <div className="ai-bubble guide typing">{t.ai.thinking}</div>}
          </div>
          <div className="ai-starters">
            {t.ai.starters.map((item) => (
              <button key={item} type="button" onClick={() => send(item)}>{item}</button>
            ))}
          </div>
          <form className="ai-compose" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.ai.placeholder}
              aria-label={t.ai.fab}
            />
            <button className="btn" type="submit" disabled={busy || !input.trim()} aria-label={t.ai.send}>
              <Icon name="send" size={16} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}

'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';
import { Icon } from '@/components/Icons';

type ChatMsg = { role: 'user' | 'guide'; text: string; urgent?: boolean; actions?: Array<{ label: string; href: string }> };

const STARTERS = [
  'Someone is bullying my child in a group chat',
  'A stranger asked for a private photo',
  'How do I save evidence calmly?',
];

export default function AiGuide() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: 'guide',
    text: 'I am SafeNest Guide, an AI helper — not a human counsellor. Ask what happened online, how to keep evidence, or which Kenyan number to call. If someone is in danger now, call 999 or 112.',
    actions: [
      { label: 'Learn', href: '/learn' },
      { label: 'Report', href: '/report' },
      { label: 'Help lines', href: '/resources' },
    ],
  }]);
  const scroller = useRef<HTMLDivElement>(null);

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
        text: data.reply || 'I could not answer just now. Try again, or call 116.',
        urgent: data.urgent,
        actions: data.actions,
      }]);
    } catch {
      setMessages((current) => [...current, {
        role: 'guide',
        text: 'The guide is offline for a moment. If this is urgent, call 999, 112, or Childline 116.',
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
          <span>Ask SafeNest AI</span>
        </button>
      )}
      {open && (
        <section className="ai-panel" aria-label="SafeNest AI guide">
          <header className="ai-panel-head">
            <div>
              <b>SafeNest Guide</b>
              <p className="tiny">Live AI help · not a human operator</p>
            </div>
            <button className="icon-chip" type="button" aria-label="Close guide" onClick={() => setOpen(false)}>
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
            {busy && <div className="ai-bubble guide typing">SafeNest is thinking…</div>}
          </div>
          <div className="ai-starters">
            {STARTERS.map((item) => (
              <button key={item} type="button" onClick={() => send(item)}>{item}</button>
            ))}
          </div>
          <form className="ai-compose" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask or paste what happened…"
              aria-label="Message SafeNest AI"
            />
            <button className="btn" type="submit" disabled={busy || !input.trim()} aria-label="Send">
              <Icon name="send" size={16} />
            </button>
          </form>
        </section>
      )}
    </>
  );
}

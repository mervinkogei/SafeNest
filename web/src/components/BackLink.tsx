'use client';

import { Icon } from '@/components/Icons';

export default function BackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <a className="back-link" href={href}>
      <span className="back-arrow" aria-hidden>
        <Icon name="back" size={20} />
      </span>
      <span>{label}</span>
    </a>
  );
}

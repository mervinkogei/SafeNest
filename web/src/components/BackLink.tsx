'use client';

import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

export default function BackLink({ href, label }: { href: string; label?: string }) {
  const { t } = useLang();
  return (
    <a className="back-link" href={href}>
      <span className="back-arrow" aria-hidden>
        <Icon name="back" size={20} />
      </span>
      <span>{label || t.common.back}</span>
    </a>
  );
}

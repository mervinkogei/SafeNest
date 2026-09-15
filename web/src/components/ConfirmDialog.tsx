'use client';

import { useLang } from '@/lib/language';

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  if (!open) return null;
  const titleId = `dialog-${title.replace(/[^a-z0-9]+/gi, '-').slice(0, 32)}`;
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <h3 id={titleId}>{title}</h3>
        <p className="muted">{body}</p>
        <div className="dialog-actions">
          <button className="btn secondary" type="button" onClick={onCancel}>{cancelLabel || t.common.cancel}</button>
          <button className={`btn ${danger ? 'danger' : ''}`} type="button" onClick={onConfirm}>{confirmLabel || t.common.confirm}</button>
        </div>
      </div>
    </div>
  );
}

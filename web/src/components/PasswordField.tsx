'use client';

import { InputHTMLAttributes, useState } from 'react';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';

export default function PasswordField({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      {label || t.common.password}
      <span className="password-wrap">
        <input {...props} type={visible ? 'text' : 'password'} />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? t.common.hidePassword : t.common.showPassword}
          onClick={() => setVisible((value) => !value)}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
        </button>
      </span>
    </label>
  );
}

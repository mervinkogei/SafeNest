'use client';

import { InputHTMLAttributes, useState } from 'react';
import { Icon } from '@/components/Icons';

export default function PasswordField({
  label = 'Password',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      {label}
      <span className="password-wrap">
        <input {...props} type={visible ? 'text' : 'password'} />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((value) => !value)}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={18} />
        </button>
      </span>
    </label>
  );
}

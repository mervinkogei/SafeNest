'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, currentUser } from '@/lib/api';
import BackLink from '@/components/BackLink';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useLang } from '@/lib/language';

type Child = { id: string; displayName: string; ageRange: string; inviteCode: string };

export default function ChildrenPage() {
  const { t } = useLang();
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Child | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Child | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{ id: string; displayName: string; ageRange: string } | null>(null);
  const [pendingStartEdit, setPendingStartEdit] = useState<Child | null>(null);

  function load() {
    api('/children').then(setChildren).catch((err) => {
      setError(err instanceof Error ? err.message : t.children.addFail);
      setChildren([]);
    });
  }
  useEffect(() => {
    const account = currentUser();
    if (!account) {
      window.location.href = '/login';
      return;
    }
    if (account.role && account.role !== 'PARENT') {
      window.location.href = '/child';
      return;
    }
    load();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const displayName = String(form.get('displayName') || '');
    const ageRange = String(form.get('ageRange') || '13-15');
    if (editing) {
      setPendingEdit({ id: editing.id, displayName, ageRange });
      return;
    }
    try {
      await api('/children', {
        method: 'POST',
        body: JSON.stringify({ displayName, ageRange }),
      });
      (event.target as HTMLFormElement).reset();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.children.addFail);
    }
  }

  async function confirmEdit() {
    if (!pendingEdit) return;
    try {
      await api(`/children/${pendingEdit.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ displayName: pendingEdit.displayName, ageRange: pendingEdit.ageRange }),
      });
      setEditing(null);
      setPendingEdit(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.children.saveFail);
      setPendingEdit(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await api(`/children/${pendingDelete.id}`, { method: 'DELETE' });
      if (editing?.id === pendingDelete.id) setEditing(null);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.children.deleteFail);
      setPendingDelete(null);
    }
  }

  return (
    <main className="page">
      <BackLink href="/parent" label={t.common.dashboard} />
      <h1>{t.children.title}</h1>
      <p className="tiny muted">{t.children.intro}</p>
      <div className="children-layout">
        <div>
          <div className="locker-grid">
            {children.map((child) => (
              <div className="card" key={child.id}>
                <b>{child.displayName}</b>
                <p className="tiny muted">{t.children.ageRange} {child.ageRange}</p>
                <p>{t.children.invite} <b>{child.inviteCode}</b></p>
                <div className="dialog-actions" style={{ marginTop: 12 }}>
                  <button className="btn secondary" type="button" onClick={() => setPendingStartEdit(child)}>{t.common.edit}</button>
                  <button className="btn danger" type="button" onClick={() => setPendingDelete(child)}>{t.common.delete}</button>
                </div>
              </div>
            ))}
          </div>
          {!children.length && (
            <div className="empty-card">
              <p>{t.children.empty}</p>
            </div>
          )}
        </div>
        <form onSubmit={onSubmit} className="form-card children-form">
          <h3>{editing ? `${t.common.edit} ${editing.displayName}` : t.children.add}</h3>
          <label className="field">{t.children.displayName}
            <input name="displayName" required defaultValue={editing?.displayName || ''} key={editing?.id || 'new'} />
          </label>
          <label className="field">{t.children.ageRange}
            <select name="ageRange" defaultValue={editing?.ageRange || '13-15'} key={`${editing?.id || 'new'}-age`}>
              <option>8-12</option>
              <option>13-15</option>
              <option>16-17</option>
            </select>
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn">{editing ? t.children.saveChanges : t.children.add}</button>
          {editing && (
            <button className="btn ghost" type="button" onClick={() => setEditing(null)}>{t.children.cancelEdit}</button>
          )}
        </form>
      </div>

      <ConfirmDialog
        open={Boolean(pendingStartEdit)}
        title={t.children.editTitle}
        body={t.children.editBody}
        confirmLabel={t.common.edit}
        onCancel={() => setPendingStartEdit(null)}
        onConfirm={() => {
          if (!pendingStartEdit) return;
          setEditing(pendingStartEdit);
          setPendingStartEdit(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingEdit)}
        title={t.children.saveTitle}
        body={t.children.saveBody}
        confirmLabel={t.common.save}
        onCancel={() => setPendingEdit(null)}
        onConfirm={confirmEdit}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t.children.deleteTitle}
        body={t.children.deleteBody}
        confirmLabel={t.common.delete}
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import BackLink from '@/components/BackLink';
import ConfirmDialog from '@/components/ConfirmDialog';

type Child = { id: string; displayName: string; ageRange: string; inviteCode: string };

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Child | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Child | null>(null);
  const [pendingEdit, setPendingEdit] = useState<{ id: string; displayName: string; ageRange: string } | null>(null);
  const [pendingStartEdit, setPendingStartEdit] = useState<Child | null>(null);

  function load() {
    api('/children').then(setChildren);
  }
  useEffect(load, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      setError(err instanceof Error ? err.message : 'Could not add profile');
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
      setError(err instanceof Error ? err.message : 'Could not save profile');
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
      setError(err instanceof Error ? err.message : 'Could not delete profile');
      setPendingDelete(null);
    }
  }

  return (
    <main className="page">
      <BackLink href="/parent" label="Dashboard" />
      <h1>Child profiles</h1>
      <p className="tiny muted">Only a display name, age range, and invite code. No school, location, or extra identity data.</p>
      <div className="locker-grid">
        {children.map((child) => (
          <div className="card" key={child.id}>
            <b>{child.displayName}</b>
            <p className="tiny muted">Age range {child.ageRange}</p>
            <p>Invite code <b>{child.inviteCode}</b></p>
            <div className="dialog-actions" style={{ marginTop: 12 }}>
              <button className="btn secondary" type="button" onClick={() => setPendingStartEdit(child)}>Edit</button>
              <button className="btn danger" type="button" onClick={() => setPendingDelete(child)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="form-card" style={{ marginTop: 24 }}>
        <h3>{editing ? `Edit ${editing.displayName}` : 'Add child profile'}</h3>
        <label className="field">Display name
          <input name="displayName" required defaultValue={editing?.displayName || ''} key={editing?.id || 'new'} />
        </label>
        <label className="field">Age range
          <select name="ageRange" defaultValue={editing?.ageRange || '13-15'} key={`${editing?.id || 'new'}-age`}>
            <option>8-12</option>
            <option>13-15</option>
            <option>16-17</option>
          </select>
        </label>
        {error && <div className="error">{error}</div>}
        <button className="btn">{editing ? 'Save changes' : 'Add child profile'}</button>
        {editing && (
          <button className="btn ghost" type="button" onClick={() => setEditing(null)}>Cancel edit</button>
        )}
      </form>

      <ConfirmDialog
        open={Boolean(pendingStartEdit)}
        title={`Edit ${pendingStartEdit?.displayName || 'this profile'}?`}
        body="You can update the display name and age range. Nothing is saved until you confirm the changes."
        confirmLabel="Edit"
        onCancel={() => setPendingStartEdit(null)}
        onConfirm={() => {
          if (!pendingStartEdit) return;
          setEditing(pendingStartEdit);
          setPendingStartEdit(null);
        }}
      />
      <ConfirmDialog
        open={Boolean(pendingEdit)}
        title="Save these changes?"
        body="This updates the child’s display name and age range only. No extra personal details are stored."
        confirmLabel="Save"
        onCancel={() => setPendingEdit(null)}
        onConfirm={confirmEdit}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this child profile?"
        body="This removes the profile from your family list. If this child still has incidents, delete those from the evidence locker first."
        confirmLabel="Delete"
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

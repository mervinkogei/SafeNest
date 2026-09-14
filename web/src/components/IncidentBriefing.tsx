'use client';

import { FormEvent, useState } from 'react';
import { Icon } from '@/components/Icons';
import {
  IncidentBriefing as Briefing,
  briefingFilename,
  briefingHtml,
  briefingPdf,
  downloadBlob,
  emailLinks,
  printBriefing,
  telegramLink,
  whatsappLink,
} from '@/lib/briefing';

export default function IncidentBriefing({ doc }: { doc: Briefing }) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [status, setStatus] = useState('');
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  function savePdf() {
    try {
      downloadBlob(briefingPdf(doc), briefingFilename(doc, 'pdf'));
      setStatus('PDF saved. Attach it if you send this by email.');
    } catch {
      setStatus('Could not build the PDF. Use Print / Save as PDF instead.');
    }
  }

  function saveHtml() {
    downloadBlob(new Blob([briefingHtml(doc)], { type: 'text/html;charset=utf-8' }), briefingFilename(doc, 'html'));
  }

  function saveText() {
    downloadBlob(new Blob([doc.plainText], { type: 'text/plain;charset=utf-8' }), briefingFilename(doc, 'txt'));
  }

  async function shareEverywhere() {
    const file = new File([briefingPdf(doc)], briefingFilename(doc, 'pdf'), { type: 'application/pdf' });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `SafeNest briefing ${doc.reference}`,
          text: doc.shareText,
          files: [file],
        });
        return;
      }
      await navigator.share({ title: `SafeNest briefing ${doc.reference}`, text: doc.shareText });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setStatus('Sharing was cancelled or is not available on this device.');
    }
  }

  function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const links = emailLinks(doc, String(form.get('to') || ''), String(form.get('note') || ''));
    const via = String(form.get('via') || 'mailto');
    window.open(via === 'gmail' ? links.gmail : via === 'outlook' ? links.outlook : links.mailto, '_blank', 'noopener,noreferrer');
    setEmailOpen(false);
    setStatus('Email draft opened. Attach the PDF if your mail app did not include the full briefing.');
  }

  return (
    <section className="briefing" id="incident-briefing">
      <div className="briefing-head">
        <div>
          <p className="tiny briefing-kicker">Confidential briefing</p>
          <h2>{doc.title}</h2>
          <p className="tiny muted">Reference {doc.reference} · Prepared {doc.preparedAt}</p>
        </div>
        <span className={`badge ${doc.assessment?.severity || 'medium'}`}>
          {doc.assessment?.immediateSafetyConcern ? 'Needs a trusted adult now' : doc.assessment?.severity || doc.record.status}
        </span>
      </div>

      <p className="briefing-alert">
        Share this only with a trusted adult, school, counsellor, or helpline. Do not post it on social media. Evidence files stay in the locker and are not attached.
      </p>

      <div className="share-grid">
        <button className="btn" type="button" onClick={savePdf}>
          <Icon name="download" size={16} /> Save PDF
        </button>
        <button className="btn secondary" type="button" onClick={() => printBriefing(doc)}>
          <Icon name="print" size={16} /> Print / Save as PDF
        </button>
        <button className="btn secondary" type="button" onClick={() => setEmailOpen(true)}>
          <Icon name="mail" size={16} /> Email
        </button>
        <a className="btn secondary" href={whatsappLink(doc.shareText)} target="_blank" rel="noreferrer">
          <Icon name="chat" size={16} /> WhatsApp
        </a>
        <a className="btn secondary" href={telegramLink(doc.shareText)} target="_blank" rel="noreferrer">
          <Icon name="send" size={16} /> Telegram
        </a>
        {canNativeShare && (
          <button className="btn secondary" type="button" onClick={shareEverywhere}>
            <Icon name="share" size={16} /> More apps
          </button>
        )}
        <button className="btn ghost" type="button" onClick={() => copy(doc.plainText, 'Full briefing copied')}>
          <Icon name="copy" size={16} /> Copy text
        </button>
        <button className="btn ghost" type="button" onClick={saveText}>
          Download .txt
        </button>
        <button className="btn ghost" type="button" onClick={saveHtml}>
          Download .html
        </button>
      </div>
      {(copied || status) && <p className="notice-inline">{copied || status}</p>}

      <div className="briefing-grid">
        <article className="box">
          <b>Young person</b>
          <p>{doc.family.youngPerson} · {doc.family.ageRange}</p>
        </article>
        <article className="box">
          <b>Reported by</b>
          <p>{doc.family.reportedBy} · {doc.family.reporterRole}</p>
        </article>
        <article className="box">
          <b>Date it happened</b>
          <p>{doc.record.occurredOnLabel}</p>
        </article>
        <article className="box">
          <b>Platform</b>
          <p>{doc.record.platform}</p>
        </article>
      </div>

      <h3>What was recorded</h3>
      <p className="tiny muted">Recorded in SafeNest {doc.record.reportedAt} · {doc.record.category} · Status: {doc.record.status}</p>
      <div className="box">
        <b>Family description</b>
        <p style={{ whiteSpace: 'pre-wrap' }}>{doc.record.description}</p>
      </div>

      <h3>Evidence preserved</h3>
      <p>
        {doc.evidence.count
          ? `${doc.evidence.count} file${doc.evidence.count === 1 ? '' : 's'} stored in the encrypted locker.`
          : 'No files were uploaded. The written record above is the preserved account.'}
      </p>
      {doc.evidence.items.length > 0 && (
        <ul className="briefing-list">
          {doc.evidence.items.map((item) => (
            <li key={`${item.label}-${item.addedAt}`}>{item.label} · {item.fileType} · added {item.addedAt}</li>
          ))}
        </ul>
      )}
      <p className="tiny muted">{doc.evidence.note}</p>

      <h3>Safety assessment</h3>
      {doc.assessment ? (
        <>
          <div className="briefing-grid">
            <article className="box">
              <b>Possible risk</b>
              <p style={{ textTransform: 'capitalize' }}>{doc.assessment.riskType}</p>
            </article>
            <article className="box">
              <b>Severity</b>
              <p style={{ textTransform: 'capitalize' }}>{doc.assessment.severity}</p>
            </article>
            <article className="box">
              <b>Immediate safety concern</b>
              <p>{doc.assessment.immediateSafetyConcern ? 'Yes — a trusted adult should review this now.' : 'No immediate emergency flagged. Still review calmly.'}</p>
            </article>
            <article className="box">
              <b>AI confidence</b>
              <p>{doc.assessment.confidenceLabel} ({Math.round(doc.assessment.confidence * 100)}%)</p>
            </article>
          </div>
          <p>{doc.assessment.explanation}</p>
          <b>Indicators</b>
          <ul className="briefing-list">
            {doc.assessment.indicators.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <b>Recommended next steps</b>
          <ol className="briefing-list">
            {doc.assessment.recommendedActions.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </>
      ) : (
        <p>No AI assessment has been generated yet.</p>
      )}

      <h3>Helplines and support</h3>
      <div className="briefing-grid">
        {doc.helplines.map((item) => (
          <article className="box" key={item.name}>
            <b>{item.name} {item.emergency && <span className="tiny" style={{ color: '#9f1239' }}>Priority</span>}</b>
            {item.phone && <p className="resource-phone">{item.phone}</p>}
            {item.website && <p><a href={item.website} target="_blank" rel="noreferrer">{item.website}</a></p>}
            <p className="tiny muted">{item.description}</p>
          </article>
        ))}
      </div>

      <h3>How to use this briefing</h3>
      <ul className="briefing-list">
        {doc.usageNotes.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="tiny muted">{doc.disclaimer}</p>

      {emailOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setEmailOpen(false)}>
          <form className="dialog email-dialog" role="dialog" aria-modal="true" aria-labelledby="email-briefing-title" onClick={(event) => event.stopPropagation()} onSubmit={sendEmail}>
            <h3 id="email-briefing-title">Send this briefing</h3>
            <p className="muted">Opens your email app with a short confidential note. Save the PDF first if you want to attach the full briefing.</p>
            <label>
              Recipient email
              <input name="to" type="email" placeholder="teacher@school.ke" autoComplete="email" />
            </label>
            <label>
              Optional note
              <textarea name="note" rows={3} placeholder="Please read this with us before the next school day." />
            </label>
            <label>
              Open with
              <select name="via" defaultValue="mailto">
                <option value="mailto">Mail app</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
              </select>
            </label>
            <div className="dialog-actions">
              <button className="btn secondary" type="button" onClick={() => setEmailOpen(false)}>Cancel</button>
              <button className="btn" type="submit">Open email</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

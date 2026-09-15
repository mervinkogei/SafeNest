'use client';

import { FormEvent, useState } from 'react';
import { Icon } from '@/components/Icons';
import { useLang } from '@/lib/language';
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
  const { t } = useLang();
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
      setStatus(t.briefing.pdfSaved);
    } catch {
      setStatus(t.briefing.pdfFail);
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
      if ((error as Error).name !== 'AbortError') setStatus(t.briefing.shareFail);
    }
  }

  function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const links = emailLinks(doc, String(form.get('to') || ''), String(form.get('note') || ''));
    const via = String(form.get('via') || 'mailto');
    window.open(via === 'gmail' ? links.gmail : via === 'outlook' ? links.outlook : links.mailto, '_blank', 'noopener,noreferrer');
    setEmailOpen(false);
    setStatus(t.briefing.emailOpened);
  }

  return (
    <section className="briefing" id="incident-briefing">
      <div className="briefing-head">
        <div>
          <p className="tiny briefing-kicker">{t.briefing.confidential}</p>
          <h2>{doc.title}</h2>
          <p className="tiny muted">{t.briefing.reference} {doc.reference} · {t.briefing.prepared} {doc.preparedAt}</p>
        </div>
        <span className={`badge ${doc.assessment?.severity || 'medium'}`}>
          {doc.assessment?.immediateSafetyConcern ? t.analysis.urgent : doc.assessment?.severity || doc.record.status}
        </span>
      </div>

      <p className="briefing-alert">{t.briefing.alert}</p>

      <div className="share-grid">
        <button className="btn" type="button" onClick={savePdf}>
          <Icon name="download" size={16} /> {t.briefing.savePdf}
        </button>
        <button className="btn secondary" type="button" onClick={() => printBriefing(doc)}>
          <Icon name="print" size={16} /> {t.briefing.print}
        </button>
        <button className="btn secondary" type="button" onClick={() => setEmailOpen(true)}>
          <Icon name="mail" size={16} /> {t.briefing.email}
        </button>
        <a className="btn secondary" href={whatsappLink(doc.shareText)} target="_blank" rel="noreferrer">
          <Icon name="chat" size={16} /> WhatsApp
        </a>
        <a className="btn secondary" href={telegramLink(doc.shareText)} target="_blank" rel="noreferrer">
          <Icon name="send" size={16} /> Telegram
        </a>
        {canNativeShare && (
          <button className="btn secondary" type="button" onClick={shareEverywhere}>
            <Icon name="share" size={16} /> {t.briefing.moreApps}
          </button>
        )}
        <button className="btn ghost" type="button" onClick={() => copy(doc.plainText, t.briefing.copied)}>
          <Icon name="copy" size={16} /> {t.briefing.copy}
        </button>
        <button className="btn ghost" type="button" onClick={saveText}>
          {t.briefing.downloadTxt}
        </button>
        <button className="btn ghost" type="button" onClick={saveHtml}>
          {t.briefing.downloadHtml}
        </button>
      </div>
      {(copied || status) && <p className="notice-inline">{copied || status}</p>}

      <div className="briefing-grid">
        <article className="box">
          <b>{t.briefing.young}</b>
          <p>{doc.family.youngPerson} · {doc.family.ageRange}</p>
        </article>
        <article className="box">
          <b>{t.briefing.reportedBy}</b>
          <p>{doc.family.reportedBy} · {doc.family.reporterRole}</p>
        </article>
        <article className="box">
          <b>{t.briefing.happened}</b>
          <p>{doc.record.occurredOnLabel}</p>
        </article>
        <article className="box">
          <b>{t.report.platform}</b>
          <p>{doc.record.platform}</p>
        </article>
      </div>

      <h3>{t.briefing.recorded}</h3>
      <p className="tiny muted">{t.briefing.recordedAt} {doc.record.reportedAt} · {doc.record.category} · {t.briefing.status}: {doc.record.status}</p>
      <div className="box">
        <b>{t.briefing.familyDesc}</b>
        <p style={{ whiteSpace: 'pre-wrap' }}>{doc.record.description}</p>
      </div>

      <h3>{t.briefing.evidence}</h3>
      <p>
        {doc.evidence.count
          ? (doc.evidence.count === 1 ? t.briefing.fileStored : t.briefing.filesStored.replace('{n}', String(doc.evidence.count)))
          : t.briefing.noFiles}
      </p>
      {doc.evidence.items.length > 0 && (
        <ul className="briefing-list">
          {doc.evidence.items.map((item) => (
            <li key={`${item.label}-${item.addedAt}`}>{item.label} · {item.fileType} · {t.briefing.added} {item.addedAt}</li>
          ))}
        </ul>
      )}
      <p className="tiny muted">{doc.evidence.note}</p>

      <h3>{t.briefing.assessment}</h3>
      {doc.assessment ? (
        <>
          <div className="briefing-grid">
            <article className="box">
              <b>{t.briefing.possible}</b>
              <p style={{ textTransform: 'capitalize' }}>{doc.assessment.riskType}</p>
            </article>
            <article className="box">
              <b>{t.briefing.severity}</b>
              <p style={{ textTransform: 'capitalize' }}>{doc.assessment.severity}</p>
            </article>
            <article className="box">
              <b>{t.briefing.immediate}</b>
              <p>{doc.assessment.immediateSafetyConcern ? t.briefing.yesNow : t.briefing.noNow}</p>
            </article>
            <article className="box">
              <b>{t.briefing.confidence}</b>
              <p>{doc.assessment.confidenceLabel} ({Math.round(doc.assessment.confidence * 100)}%)</p>
            </article>
          </div>
          <p>{doc.assessment.explanation}</p>
          <b>{t.briefing.indicators}</b>
          <ul className="briefing-list">
            {doc.assessment.indicators.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <b>{t.briefing.steps}</b>
          <ol className="briefing-list">
            {doc.assessment.recommendedActions.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </>
      ) : (
        <p>{t.briefing.noAssessment}</p>
      )}

      <h3>{t.briefing.helplines}</h3>
      <div className="briefing-grid">
        {doc.helplines.map((item) => (
          <article className="box" key={item.name}>
            <b>{item.name} {item.emergency && <span className="tiny" style={{ color: '#9f1239' }}>{t.briefing.priority}</span>}</b>
            {item.phone && <p className="resource-phone">{item.phone}</p>}
            {item.website && <p><a href={item.website} target="_blank" rel="noreferrer">{item.website}</a></p>}
            <p className="tiny muted">{item.description}</p>
          </article>
        ))}
      </div>

      <h3>{t.briefing.how}</h3>
      <ul className="briefing-list">
        {doc.usageNotes.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="tiny muted">{doc.disclaimer}</p>

      {emailOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setEmailOpen(false)}>
          <form className="dialog email-dialog" role="dialog" aria-modal="true" aria-labelledby="email-briefing-title" onClick={(event) => event.stopPropagation()} onSubmit={sendEmail}>
            <h3 id="email-briefing-title">{t.briefing.sendTitle}</h3>
            <p className="muted">{t.briefing.sendHint}</p>
            <label>
              {t.briefing.recipient}
              <input name="to" type="email" placeholder="teacher@school.ke" autoComplete="email" />
            </label>
            <label>
              {t.briefing.note}
              <textarea name="note" rows={3} placeholder={t.briefing.notePlaceholder} />
            </label>
            <label>
              {t.briefing.openWith}
              <select name="via" defaultValue="mailto">
                <option value="mailto">{t.briefing.mailApp}</option>
                <option value="gmail">Gmail</option>
                <option value="outlook">Outlook</option>
              </select>
            </label>
            <div className="dialog-actions">
              <button className="btn secondary" type="button" onClick={() => setEmailOpen(false)}>{t.common.cancel}</button>
              <button className="btn" type="submit">{t.briefing.openEmail}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export type IncidentBriefing = {
  reference: string;
  preparedAt: string;
  title: string;
  family: {
    youngPerson: string;
    ageRange: string;
    reportedBy: string;
    reporterRole: string;
  };
  record: {
    reportedAt: string;
    occurredOn: string | null;
    occurredOnLabel: string;
    platform: string;
    category: string;
    status: string;
    description: string;
  };
  evidence: {
    count: number;
    items: Array<{ label: string; fileType: string; addedAt: string }>;
    note: string;
  };
  assessment: {
    riskType: string;
    severity: string;
    confidence: number;
    confidenceLabel: string;
    immediateSafetyConcern: boolean;
    explanation: string;
    indicators: string[];
    recommendedActions: string[];
  } | null;
  helplines: Array<{
    name: string;
    phone: string;
    website: string;
    description: string;
    emergency: boolean;
  }>;
  disclaimer: string;
  usageNotes: string[];
  plainText: string;
  shareText: string;
};

export function briefingFilename(doc: IncidentBriefing, ext: string) {
  return `SafeNest-briefing-${doc.reference}.${ext}`;
}

export function downloadBlob(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function pdfSafe(text: string) {
  return text
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x09\x20-\x7E]/g, (char) => {
      try {
        return char.normalize('NFKD').replace(/[\u0300-\u036f]/g, '') || '?';
      } catch {
        return '?';
      }
    })
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(text: string, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      if (word.length > width) {
        for (let i = 0; i < word.length; i += width) lines.push(word.slice(i, i + width));
        current = '';
      } else {
        current = word;
      }
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

export function briefingPdf(doc: IncidentBriefing) {
  type Run = { text: string; bold?: boolean; size?: number; gap?: number };
  const runs: Run[] = [
    { text: 'SAFENEST INCIDENT BRIEFING', bold: true, size: 16, gap: 16 },
    { text: 'CONFIDENTIAL - for a trusted adult, school, counsellor, or helpline', size: 10, gap: 14 },
    { text: `Reference: ${doc.reference}`, bold: true, gap: 12 },
    { text: `Prepared: ${doc.preparedAt}`, size: 10, gap: 18 },
    { text: '1. Who this is about', bold: true, size: 13, gap: 16 },
    { text: `Young person: ${doc.family.youngPerson} (${doc.family.ageRange})` },
    { text: `Reported by: ${doc.family.reportedBy} (${doc.family.reporterRole})`, gap: 16 },
    { text: '2. What was recorded', bold: true, size: 13, gap: 16 },
    { text: `Date reported in SafeNest: ${doc.record.reportedAt}` },
    { text: `Date it happened: ${doc.record.occurredOnLabel}` },
    { text: `Platform: ${doc.record.platform}` },
    { text: `Concern described by the family: ${doc.record.category}` },
    { text: `Status: ${doc.record.status}`, gap: 12 },
    { text: 'Family description:', bold: true, gap: 12 },
    { text: doc.record.description, gap: 16 },
    { text: '3. Evidence preserved', bold: true, size: 13, gap: 16 },
    {
      text: doc.evidence.count
        ? `${doc.evidence.count} file${doc.evidence.count === 1 ? '' : 's'} stored in the SafeNest locker.`
        : 'No files were uploaded. The written record above is the preserved account.',
    },
    ...doc.evidence.items.map((item) => ({ text: `- ${item.label} (${item.fileType}), added ${item.addedAt}` })),
    { text: doc.evidence.note, gap: 16 },
    { text: '4. Safety assessment (AI-assisted)', bold: true, size: 13, gap: 16 },
  ];

  if (doc.assessment) {
    runs.push(
      { text: `Possible risk: ${doc.assessment.riskType}` },
      { text: `Severity: ${doc.assessment.severity}` },
      {
        text: `Immediate safety concern: ${
          doc.assessment.immediateSafetyConcern
            ? 'Yes - a trusted adult should review this now'
            : 'No immediate emergency flagged, still review calmly'
        }`,
      },
      { text: `AI confidence: ${doc.assessment.confidenceLabel} (${Math.round(doc.assessment.confidence * 100)}%)`, gap: 12 },
      { text: doc.assessment.explanation, gap: 12 },
      { text: 'Indicators:', bold: true, gap: 12 },
      ...doc.assessment.indicators.map((item) => ({ text: `- ${item}` })),
      { text: 'Recommended next steps:', bold: true, gap: 12 },
      ...doc.assessment.recommendedActions.map((item, index) => ({ text: `${index + 1}. ${item}` })),
    );
  } else {
    runs.push({ text: 'No AI assessment has been generated yet.' });
  }

  runs.push({ text: '5. Helplines and support', bold: true, size: 13, gap: 16 });
  for (const item of doc.helplines) {
    runs.push(
      { text: `${item.name}${item.emergency ? ' (emergency / priority)' : ''}`, bold: true, gap: 12 },
      ...(item.phone ? [{ text: `Phone: ${item.phone}` }] : []),
      ...(item.website ? [{ text: `Web: ${item.website}` }] : []),
      { text: item.description, gap: 12 },
    );
  }

  runs.push(
    { text: '6. How to use this briefing', bold: true, size: 13, gap: 16 },
    ...doc.usageNotes.map((item) => ({ text: `- ${item}` })),
    { text: doc.disclaimer, gap: 16 },
  );

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const usable = 90;
  const pageStreams: string[] = [];
  let content = '';
  let y = pageHeight - margin;

  function flushPage() {
    if (!content) return;
    pageStreams.push(`BT\n${content}ET\n`);
    content = '';
    y = pageHeight - margin;
  }

  for (const run of runs) {
    const size = run.size || 11;
    const leading = size + 3;
    const wrapped = wrapLine(run.text, run.bold && size >= 13 ? 78 : usable);
    for (const line of wrapped) {
      if (y < margin + 24) flushPage();
      const font = run.bold ? '/F2' : '/F1';
      content += `${font} ${size} Tf\n1 0 0 1 ${margin} ${y.toFixed(2)} Tm\n(${pdfSafe(line)}) Tj\n`;
      y -= leading;
    }
    y -= run.gap ? Math.max(4, run.gap - leading) : 4;
  }
  flushPage();
  if (!pageStreams.length) pageStreams.push('BT\nET\n');

  const pageIds = pageStreams.map((_, i) => 5 + i * 2);
  const catalog = '<< /Type /Catalog /Pages 2 0 R >>';
  const pagesObj = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageStreams.length} >>`;
  const regular = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  const bold = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
  const body = [catalog, pagesObj, regular, bold];
  pageStreams.forEach((stream, i) => {
    const contentId = pageIds[i] + 1;
    body.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    body.push(`<< /Length ${stream.length} >>\nstream\n${stream}endstream`);
  });
  const xref: number[] = [];
  let output = '%PDF-1.4\n';
  body.forEach((item, i) => {
    xref.push(output.length);
    output += `${i + 1} 0 obj\n${item}\nendobj\n`;
  });
  const start = output.length;
  output += `xref\n0 ${body.length + 1}\n0000000000 65535 f \n`;
  xref.forEach((offset) => {
    output += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  output += `trailer\n<< /Size ${body.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return new Blob([output], { type: 'application/pdf' });
}

export function briefingHtml(doc: IncidentBriefing) {
  const escape = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const helplines = doc.helplines
    .map(
      (item) => `
        <article class="box">
          <h3>${escape(item.name)}${item.emergency ? ' <span class="urgent">Priority</span>' : ''}</h3>
          ${item.phone ? `<p class="phone">${escape(item.phone)}</p>` : ''}
          ${item.website ? `<p><a href="${escape(item.website)}">${escape(item.website)}</a></p>` : ''}
          <p>${escape(item.description)}</p>
        </article>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escape(doc.title)} · ${escape(doc.reference)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: "Source Sans 3", "Segoe UI", sans-serif; color: #1c1917; margin: 0; background: #fff; }
    main { width: min(800px, calc(100% - 48px)); margin: 28px auto 48px; }
    h1, h2, h3 { font-family: Fraunces, Georgia, serif; letter-spacing: -0.03em; }
    h1 { font-size: 1.8rem; margin: 8px 0 6px; }
    h2 { font-size: 1.15rem; margin: 28px 0 10px; color: #0f5c4c; }
    h3 { font-size: 1rem; margin: 0 0 6px; }
    .kicker { text-transform: uppercase; letter-spacing: 0.12em; font-size: 11px; font-weight: 700; color: #c45c26; }
    .meta { color: #57534e; font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
    .box { border: 1px solid #e7e0d4; border-radius: 14px; padding: 14px 16px; margin: 10px 0; }
    .phone { font-size: 1.2rem; font-weight: 800; color: #0f5c4c; margin: 4px 0; }
    .urgent { display: inline-block; background: #9f1239; color: #fff; font-size: 11px; border-radius: 999px; padding: 2px 8px; font-family: "Source Sans 3", sans-serif; }
    .badge { display: inline-block; background: #0f5c4c; color: #fff; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    ul, ol { margin: 8px 0; padding-left: 18px; }
    li { margin: 6px 0; }
    p { line-height: 1.55; }
    .disclaimer { font-size: 13px; color: #57534e; }
    @media print { body { background: #fff; } main { width: auto; margin: 0; } a { color: inherit; text-decoration: none; } }
  </style>
</head>
<body>
  <main>
    <p class="kicker">Confidential · SafeNest incident briefing</p>
    <h1>${escape(doc.title)}</h1>
    <p class="meta">Reference ${escape(doc.reference)} · Prepared ${escape(doc.preparedAt)}</p>
    <span class="badge">${escape(doc.assessment?.severity || doc.record.status)}</span>
    <h2>1. Who this is about</h2>
    <div class="grid">
      <div class="box"><b>Young person</b><p>${escape(doc.family.youngPerson)} · ${escape(doc.family.ageRange)}</p></div>
      <div class="box"><b>Reported by</b><p>${escape(doc.family.reportedBy)} · ${escape(doc.family.reporterRole)}</p></div>
    </div>
    <h2>2. What was recorded</h2>
    <div class="grid">
      <div class="box"><b>Date it happened</b><p>${escape(doc.record.occurredOnLabel)}</p></div>
      <div class="box"><b>Recorded in SafeNest</b><p>${escape(doc.record.reportedAt)}</p></div>
      <div class="box"><b>Platform</b><p>${escape(doc.record.platform)}</p></div>
      <div class="box"><b>Family description of the concern</b><p>${escape(doc.record.category)}</p></div>
    </div>
    <div class="box"><b>What the family wrote</b><p>${escape(doc.record.description)}</p></div>
    <h2>3. Evidence preserved</h2>
    <p>${doc.evidence.count ? `${doc.evidence.count} file${doc.evidence.count === 1 ? '' : 's'} stored in the encrypted locker.` : 'No files were uploaded.'}</p>
    ${doc.evidence.items.length ? `<ul>${doc.evidence.items.map((item) => `<li>${escape(item.label)} · ${escape(item.fileType)} · added ${escape(item.addedAt)}</li>`).join('')}</ul>` : ''}
    <p class="disclaimer">${escape(doc.evidence.note)}</p>
    <h2>4. Safety assessment (AI-assisted)</h2>
    ${
      doc.assessment
        ? `<div class="grid">
            <div class="box"><b>Possible risk</b><p style="text-transform:capitalize">${escape(doc.assessment.riskType)}</p></div>
            <div class="box"><b>Severity</b><p style="text-transform:capitalize">${escape(doc.assessment.severity)}</p></div>
            <div class="box"><b>Immediate safety concern</b><p>${doc.assessment.immediateSafetyConcern ? 'Yes — a trusted adult should review this now.' : 'No immediate emergency flagged. Still review calmly.'}</p></div>
            <div class="box"><b>AI confidence</b><p>${escape(doc.assessment.confidenceLabel)} (${Math.round(doc.assessment.confidence * 100)}%)</p></div>
          </div>
          <div class="box"><b>Why this was flagged</b><p>${escape(doc.assessment.explanation)}</p></div>
          <h3>Indicators</h3>
          <ul>${doc.assessment.indicators.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>
          <h3>Recommended next steps</h3>
          <ol>${doc.assessment.recommendedActions.map((item) => `<li>${escape(item)}</li>`).join('')}</ol>`
        : '<p>No AI assessment has been generated yet.</p>'
    }
    <h2>5. Helplines and support</h2>
    ${helplines}
    <h2>6. How to use this briefing</h2>
    <ul>${doc.usageNotes.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>
    <p class="disclaimer">${escape(doc.disclaimer)}</p>
  </main>
</body>
</html>`;
}

export function printBriefing(doc: IncidentBriefing) {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.position = 'fixed';
  frame.style.right = '0';
  frame.style.bottom = '0';
  frame.style.width = '0';
  frame.style.height = '0';
  frame.style.border = '0';
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  if (!win) return;
  win.document.open();
  win.document.write(briefingHtml(doc));
  win.document.close();
  const cleanup = () => frame.remove();
  win.addEventListener('afterprint', cleanup);
  setTimeout(() => {
    win.focus();
    win.print();
  }, 250);
}

export function emailLinks(doc: IncidentBriefing, to = '', note = '') {
  const subject = `SafeNest briefing ${doc.reference}: ${doc.assessment?.riskType || 'incident'} (confidential)`;
  const body = [
    note && `Note from the family:\n${note}\n`,
    doc.shareText,
    '',
    'Please treat this as confidential. Attach the SafeNest PDF briefing if you have it. Evidence files are not included.',
  ]
    .filter(Boolean)
    .join('\n');
  const query = new URLSearchParams({ subject, body });
  const gmail = new URLSearchParams({ view: 'cm', fs: '1', su: subject, body, to });
  return {
    subject,
    body,
    mailto: `mailto:${encodeURIComponent(to)}?${query.toString()}`,
    gmail: `https://mail.google.com/mail/?${gmail.toString()}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?${new URLSearchParams({ to, subject, body }).toString()}`,
  };
}

export function whatsappLink(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function telegramLink(text: string) {
  return `https://t.me/share/url?text=${encodeURIComponent(text)}`;
}

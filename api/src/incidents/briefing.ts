const CATEGORY_LABELS: Record<string, string> = {
  bullying: 'Bullying',
  threatened: 'Threats or intimidation',
  uncomfortable: 'Uncomfortable contact',
  private: 'Request for something private',
  unsure: 'Family was unsure how to classify it',
  other: 'Other concern',
};

export type BriefingDoc = {
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
};

export type IncidentBriefing = BriefingDoc & {
  plainText: string;
  shareText: string;
};

function kenyaDate(value: string | Date) {
  return new Date(value).toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'full',
    timeStyle: 'short',
  });
}

function kenyaDay(value: string | Date) {
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return date.toLocaleDateString('en-KE', {
    timeZone: 'Africa/Nairobi',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function labelFile(fileType?: string) {
  if (!fileType) return 'Saved file';
  if (fileType.startsWith('image/')) return 'Screenshot or image';
  if (fileType === 'application/pdf') return 'PDF document';
  if (fileType.startsWith('audio/')) return 'Audio recording';
  if (fileType.startsWith('video/')) return 'Video';
  if (fileType.startsWith('text/')) return 'Text file';
  return 'Saved file';
}

function words(value: string) {
  return (value || '').replaceAll('_', ' ');
}

export function parseOccurredOn(description: string) {
  const match = (description || '').match(/^Date it happened: (\d{4}-\d{2}-\d{2})/);
  return match?.[1] || null;
}

export function stripOccurredOn(description: string) {
  return (description || '').replace(/^Date it happened: \d{4}-\d{2}-\d{2}\n\n?/, '').trim();
}

export function buildBriefing(incident: {
  id: string;
  platform: string;
  description: string;
  category: string;
  status: string;
  createdAt: Date | string;
  child: { displayName: string; ageRange: string };
  reporter: { name: string; role: string };
  evidence: Array<{ fileType?: string; createdAt: Date | string }>;
  assessment: {
    riskType: string;
    severity: string;
    confidence: number;
    explanation: string;
    immediateSafetyConcern: boolean;
    indicators: string[];
    recommendedActions: string[];
  } | null;
  resources: Array<{ name: string; phone?: string | null; website: string; description: string; emergency: boolean }>;
}): IncidentBriefing {
  const occurredOn = parseOccurredOn(incident.description);
  const narrative = stripOccurredOn(incident.description)
    || 'No written description was added. Evidence files may still be stored in the locker.';
  const assessment = incident.assessment;
  const doc: BriefingDoc = {
    reference: `SN-${incident.id.slice(-6).toUpperCase()}`,
    preparedAt: kenyaDate(new Date()),
    title: assessment ? `Incident briefing: ${words(assessment.riskType)}` : 'Incident briefing',
    family: {
      youngPerson: incident.child.displayName,
      ageRange: incident.child.ageRange,
      reportedBy: incident.reporter.name,
      reporterRole: incident.reporter.role === 'CHILD' ? 'Young person' : 'Parent or guardian',
    },
    record: {
      reportedAt: kenyaDate(incident.createdAt),
      occurredOn,
      occurredOnLabel: occurredOn ? kenyaDay(occurredOn) : 'Not specified',
      platform: incident.platform,
      category: CATEGORY_LABELS[incident.category] || words(incident.category),
      status: words(incident.status),
      description: narrative,
    },
    evidence: {
      count: incident.evidence.length,
      items: incident.evidence.map((item, index) => ({
        label: `${labelFile(item.fileType)} ${index + 1}`,
        fileType: item.fileType || 'file',
        addedAt: kenyaDate(item.createdAt),
      })),
      note: 'Evidence files stay in the encrypted SafeNest locker. They are not attached to this briefing. Do not circulate screenshots, especially any image of a child.',
    },
    assessment: assessment
      ? {
          riskType: words(assessment.riskType),
          severity: assessment.severity,
          confidence: assessment.confidence,
          confidenceLabel:
            assessment.confidence >= 0.8 ? 'High' : assessment.confidence >= 0.6 ? 'Moderate' : 'Low',
          immediateSafetyConcern: assessment.immediateSafetyConcern,
          explanation: assessment.explanation,
          indicators: assessment.indicators,
          recommendedActions: assessment.recommendedActions,
        }
      : null,
    helplines: incident.resources.map((item) => ({
      name: item.name,
      phone: item.phone || '',
      website: item.website,
      description: item.description,
      emergency: item.emergency,
    })),
    disclaimer:
      'This briefing is a family record to help a trusted adult, school, counsellor, or helpline understand what was reported. SafeNest’s AI notes possible risk. It is not a finding of guilt, not a police statement, and not a medical or legal conclusion.',
    usageNotes: [
      'Share only with a trusted adult, school safeguarding lead, counsellor, or official helpline.',
      'Do not post this briefing or any evidence on social media, class groups, or public chats.',
      'If anyone is in immediate danger, call 999 or 112 in Kenya. For children in distress, call Childline 116.',
      'Keep original chats and files. Do not ask the young person for account passwords.',
    ],
  };

  return {
    ...doc,
    plainText: toPlainText(doc),
    shareText: toShareText(doc),
  };
}

function toPlainText(doc: BriefingDoc) {
  const lines = [
    'SAFENEST INCIDENT BRIEFING',
    'CONFIDENTIAL — for a trusted adult, school, counsellor, or helpline',
    '',
    `Reference: ${doc.reference}`,
    `Prepared: ${doc.preparedAt}`,
    '',
    '1. Who this is about',
    `Young person: ${doc.family.youngPerson} (${doc.family.ageRange})`,
    `Reported by: ${doc.family.reportedBy} (${doc.family.reporterRole})`,
    '',
    '2. What was recorded',
    `Date reported in SafeNest: ${doc.record.reportedAt}`,
    `Date it happened: ${doc.record.occurredOnLabel}`,
    `Platform: ${doc.record.platform}`,
    `Concern described by the family: ${doc.record.category}`,
    `Status: ${doc.record.status}`,
    '',
    'Family description:',
    doc.record.description,
    '',
    '3. Evidence preserved',
    doc.evidence.count
      ? `${doc.evidence.count} file${doc.evidence.count === 1 ? '' : 's'} stored in the SafeNest locker:`
      : 'No files were uploaded. The written record above is the preserved account.',
    ...doc.evidence.items.map((item) => `- ${item.label} (${item.fileType}), added ${item.addedAt}`),
    doc.evidence.note,
    '',
    '4. Safety assessment (AI-assisted)',
  ];

  if (doc.assessment) {
    lines.push(
      `Possible risk: ${doc.assessment.riskType}`,
      `Severity: ${doc.assessment.severity}`,
      `Immediate safety concern: ${doc.assessment.immediateSafetyConcern ? 'Yes — a trusted adult should review this now' : 'No immediate emergency flagged, still review calmly'}`,
      `AI confidence: ${doc.assessment.confidenceLabel} (${Math.round(doc.assessment.confidence * 100)}%)`,
      '',
      doc.assessment.explanation,
      '',
      'Indicators:',
      ...doc.assessment.indicators.map((item) => `- ${item}`),
      '',
      'Recommended next steps:',
      ...doc.assessment.recommendedActions.map((item, index) => `${index + 1}. ${item}`),
    );
  } else {
    lines.push('No AI assessment has been generated yet.');
  }

  lines.push('', '5. Helplines and support');
  for (const item of doc.helplines) {
    lines.push(
      '',
      `${item.name}${item.emergency ? ' (emergency / priority)' : ''}`,
      item.phone ? `Phone: ${item.phone}` : '',
      item.website ? `Web: ${item.website}` : '',
      item.description,
    );
  }

  lines.push('', '6. How to use this briefing', ...doc.usageNotes.map((item) => `- ${item}`), '', doc.disclaimer);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function toShareText(doc: BriefingDoc) {
  const risk = doc.assessment?.riskType || 'online concern';
  const severity = doc.assessment?.severity || 'unspecified';
  const urgent = doc.assessment?.immediateSafetyConcern
    ? 'A trusted adult should review this now.'
    : 'Please review this record with the family.';
  return [
    `SafeNest briefing ${doc.reference} (confidential)`,
    `${doc.family.youngPerson}: possible ${risk}, severity ${severity}.`,
    `Platform: ${doc.record.platform}. Happened: ${doc.record.occurredOnLabel}.`,
    urgent,
    'Evidence stays in the family locker — files are not attached.',
    'Kenya: 999/112 if danger, Childline 116.',
    'Not a finding of guilt. Full briefing is in the PDF.',
  ].join('\n');
}

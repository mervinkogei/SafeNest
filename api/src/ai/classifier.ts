export const RISK_TYPES = [
  'cyberbullying',
  'harassment',
  'threat',
  'grooming_indicator',
  'sexual_harassment',
  'coercion',
  'hate_abuse',
  'impersonation',
  'other',
  'no_clear_risk',
] as const;

export type RiskType = (typeof RISK_TYPES)[number];
export type Severity = 'low' | 'medium' | 'serious' | 'critical';

export interface SafetyAssessment {
  riskType: RiskType;
  severity: Severity;
  confidence: number;
  indicators: string[];
  explanation: string;
  immediateSafetyConcern: boolean;
  recommendedActions: string[];
}

const CATEGORY_HINTS: Record<string, RiskType> = {
  bullying: 'cyberbullying',
  threatened: 'threat',
  uncomfortable: 'harassment',
  private: 'grooming_indicator',
  unsure: 'other',
  other: 'other',
};

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function sanitizeText(input: string) {
  return (input || '')
    .replace(/https?:\/\/\S+/gi, '[link removed]')
    .replace(/\b[\w.+-]+@[\w.-]+\.\w+\b/gi, '[email removed]')
    .replace(/\b(\+?\d[\d\s-]{7,}\d)\b/g, '[number removed]')
    .trim();
}

export function classifySafety(rawText: string, category?: string): SafetyAssessment {
  const text = sanitizeText(rawText).toLowerCase();
  const indicators: string[] = [];

  const insult = includesAny(text, ['stupid', 'ugly', 'loser', 'nobody likes', 'kill yourself', 'kys', 'dumb', 'worthless']);
  const repeated = /\b(again|always|every day|keep|still)\b/.test(text);
  const threat = includesAny(text, ['i will kill', "i'll beat", 'come for you', 'hurt you', 'find you', 'wait for you']);
  const secret = includesAny(text, ["don't tell", 'dont tell', 'keep this secret', 'our secret', 'special friend']);
  const privateAsk = includesAny(text, ['send pic', 'send photo', 'nudes', 'undress', 'your body', 'show me']);
  const coercion = includesAny(text, ['if you don’t', "if you don't", 'or else', 'i will tell everyone', 'unless you']);
  const hate = includesAny(text, ['hate you', 'go back', 'you people', 'monkey', 'tribe']);
  const impersonation = includesAny(text, ['this is not me', 'fake account', 'pretending', 'hacked']);
  const publicShame = includesAny(text, ['group', 'everyone saw', 'posted', 'status', 'class group']);

  if (insult) indicators.push('Targeted insults directed at the young person');
  if (repeated && insult) indicators.push('Repeated behaviour rather than a one-off comment');
  if (publicShame) indicators.push('Possible public humiliation');
  if (threat) indicators.push('Language that describes harm or intimidation');
  if (secret) indicators.push('Pressure to keep the conversation secret from trusted adults');
  if (privateAsk) indicators.push('Request for private or sexual images');
  if (coercion) indicators.push('Pressure or conditions attached to a request');
  if (hate) indicators.push('Abusive or identity-based language');
  if (impersonation) indicators.push('Possible impersonation or fake account');

  let riskType: RiskType = CATEGORY_HINTS[category || ''] || 'other';
  if (privateAsk || secret) riskType = privateAsk ? 'grooming_indicator' : 'grooming_indicator';
  if (privateAsk && coercion) riskType = 'coercion';
  if (threat) riskType = 'threat';
  if (!threat && !privateAsk && insult) riskType = 'cyberbullying';
  if (!threat && !privateAsk && !insult && hate) riskType = 'hate_abuse';
  if (!indicators.length && category === 'unsure') riskType = 'other';
  if (!indicators.length && !category) riskType = 'no_clear_risk';
  if (impersonation && !threat && !privateAsk) riskType = 'impersonation';

  const immediateSafetyConcern = threat || privateAsk || coercion;
  let severity: Severity = 'low';
  if (indicators.length) severity = 'medium';
  if (insult && (repeated || publicShame)) severity = 'serious';
  if (immediateSafetyConcern) severity = threat || privateAsk ? 'critical' : 'serious';
  if (riskType === 'no_clear_risk') severity = 'low';

  const confidence = Math.min(0.92, 0.55 + indicators.length * 0.08);

  const explanation = indicators.length
    ? `The content appears to include ${indicators[0].toLowerCase()}. SafeNest is flagging possible risk so a trusted adult can review it calmly. This is not a finding of guilt.`
    : 'There is not enough clear harmful language in what was shared to classify a specific risk. A trusted adult can still talk with the young person and keep a record if they feel uneasy.';

  const recommendedActions = immediateSafetyConcern
    ? [
        'Preserve the evidence without confronting the other person',
        'Stay with the child and make sure they are physically safe',
        'Call 999 or 112 if anyone is in immediate danger',
        'Contact Childline Kenya on 116',
        'Do not ask the child to reply, retaliate, or share account passwords',
      ]
    : [
        'Preserve the evidence',
        'Talk calmly with the child without blaming them',
        'Avoid retaliation or public confrontation',
        'Report the content using the platform tools',
        'Seek additional support if the behaviour continues',
      ];

  return {
    riskType,
    severity,
    confidence: Number(confidence.toFixed(2)),
    indicators: indicators.length ? indicators : ['No strong harmful indicators in the provided text'],
    explanation,
    immediateSafetyConcern,
    recommendedActions,
  };
}

export function parseModelAssessment(raw: string): SafetyAssessment | null {
  try {
    const json = JSON.parse(raw);
    if (!RISK_TYPES.includes(json.riskType)) return null;
    return {
      riskType: json.riskType,
      severity: ['low', 'medium', 'serious', 'critical'].includes(json.severity) ? json.severity : 'medium',
      confidence: Math.max(0, Math.min(1, Number(json.confidence) || 0.5)),
      indicators: Array.isArray(json.indicators) ? json.indicators.slice(0, 6).map(String) : [],
      explanation: String(json.explanation || ''),
      immediateSafetyConcern: Boolean(json.immediateSafetyConcern),
      recommendedActions: Array.isArray(json.recommendedActions)
        ? json.recommendedActions.slice(0, 6).map(String)
        : [],
    };
  } catch {
    return null;
  }
}

import { Injectable } from '@nestjs/common';
import { SYSTEM_PROMPT } from './prompts/system-prompt';
import { classifySafety, parseModelAssessment, sanitizeText, SafetyAssessment } from './classifier';
import { fallbackGuide, GUIDE_PROMPT } from './guide';

@Injectable()
export class AiService {
  async analyze(input: { description: string; category?: string; ocrText?: string }): Promise<SafetyAssessment> {
    const combined = sanitizeText([input.category, input.description, input.ocrText].filter(Boolean).join('\n'));
    const fallback = classifySafety(`${input.category || ''} ${input.description || ''} ${input.ocrText || ''}`, input.category);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return fallback;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Incident category selected by the user: ${input.category || 'not specified'}\n\nSanitized content:\n${combined}`,
            },
          ],
        }),
      });
      if (!response.ok) return fallback;
      const data = await response.json();
      return parseModelAssessment(data.choices?.[0]?.message?.content || '') || fallback;
    } catch {
      return fallback;
    }
  }

  async guide(message: string, context?: string) {
    const clean = sanitizeText(message).slice(0, 800);
    const fallback = fallbackGuide(`${context || ''} ${clean}`);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { ...fallback, source: 'safenest-guide' };

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: GUIDE_PROMPT },
            {
              role: 'user',
              content: `${context ? `Context: ${sanitizeText(context).slice(0, 500)}\n\n` : ''}User: ${clean}`,
            },
          ],
        }),
      });
      if (!response.ok) return { ...fallback, source: 'safenest-guide' };
      const data = await response.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      return {
        reply: String(parsed.reply || fallback.reply),
        urgent: Boolean(parsed.urgent) || fallback.urgent,
        actions: Array.isArray(parsed.actions) && parsed.actions.length
          ? parsed.actions.slice(0, 4).map((item: { label?: string; href?: string }) => ({
              label: String(item.label || 'Learn more'),
              href: String(item.href || '/learn'),
            }))
          : fallback.actions,
        source: 'safenest-guide',
      };
    } catch {
      return { ...fallback, source: 'safenest-guide' };
    }
  }
}

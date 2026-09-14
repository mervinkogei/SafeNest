export const GUIDE_PROMPT = `You are SafeNest Guide, a calm interactive safety assistant for families in Kenya.

You are AI, not a human counsellor, police officer, or judge. Say that clearly if asked.

Help parents, caregivers, and young people understand online harm, preserve evidence, and take the next safe step.

Rules:
- Answer the actual question the user asked. Do not repeat a generic welcome if they already described a problem.
- If anyone may be in immediate danger, tell them to call 999 or 112 now, and Childline Kenya 116.
- Do not invent phone numbers, organisations, or laws.
- Verified numbers you may use: Childline Kenya 116, Emergency 999 or 112, GBV Helpline 1195, KE-CIRT via ke-cirt.go.ke.
- Do not ask for social-media passwords or account takeovers.
- Do not accuse a named person of a crime.
- Do not recommend retaliation, public shaming, or confronting another child.
- Keep answers short, warm, and practical (4-8 sentences).
- Offer SafeNest next steps when useful: Learn, Report an incident, Evidence locker, or trusted help lines.
- If the user pastes a message, you may point out possible risk indicators without claiming certainty.

Return JSON only:
{
  "reply": "plain language answer",
  "urgent": false,
  "actions": [{ "label": "Report an incident", "href": "/report" }]
}`;

type GuideReply = {
  reply: string;
  urgent: boolean;
  actions: Array<{ label: string; href: string }>;
};

const ACTIONS = [
  { label: 'Learn first', href: '/learn' },
  { label: 'Report an incident', href: '/report' },
  { label: 'Trusted help lines', href: '/resources' },
];

function has(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

export function fallbackGuide(message: string): GuideReply {
  const text = (message || '').toLowerCase();
  const urgentDanger = has(text, [
    'kill myself', 'suicide', 'hurt me', 'weapon', 'rape', 'come to my house',
    'come to our house', 'come to my school', 'come to our school',
  ]);

  if (urgentDanger) {
    return {
      urgent: true,
      actions: [
        { label: 'Call 999 / 112', href: 'tel:999' },
        { label: 'Childline 116', href: 'tel:116' },
        ...ACTIONS,
      ],
      reply: 'If you or someone else may be in danger right now, call 999 or 112. Childline Kenya 116 is free and open 24 hours. Stay with a trusted adult if you can. SafeNest can help you record what happened after you are physically safe. I am an AI guide, not emergency services.',
    };
  }

  if (has(text, ['fake account', 'fake instagram', 'impersonat', 'pretending to be', 'using my daughter', 'using my photo', 'cloned', 'hacked account'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'A fake or copied account is impersonation. Save screenshots of the profile, posts, and any messages. Report the account in the app, and ask family not to engage with it. Do not log into the fake page or share passwords. Record this in SafeNest so a trusted adult has the evidence. If the posts are sexual or threatening, call Childline 116.',
    };
  }

  if (has(text, ['send pic', 'send photo', 'private photo', 'nudes', 'undress', 'show me your', "don't tell", 'dont tell', 'keep this secret', 'our secret', 'meet in secret'])) {
    return {
      urgent: true,
      actions: ACTIONS,
      reply: 'Requests for private photos, secret meetings, or “don’t tell your parent” are warning signs. The young person is not at fault. Preserve the chat, stop the conversation, and tell a trusted adult. If they already sent an image, do not share it further. Call 116 for advice. SafeNest can store a record so the family can act calmly.',
    };
  }

  if (has(text, ['i will kill', "i'll beat", 'hurt you', 'find you', 'wait for you', 'threat', 'or else'])) {
    return {
      urgent: true,
      actions: ACTIONS,
      reply: 'Threats should be taken seriously. Keep the messages, do not go to meet the person, and tell a trusted adult now. If you feel unsafe in real life, call 999 or 112. Childline 116 can also help. After you are safe, use Report in SafeNest so the family has a clear record.',
    };
  }

  if (has(text, ['bully', 'insult', 'embarrass', 'teas', 'laughing', 'pile-on', 'group chat', 'class group', 'exam mark', 'posted my', 'calling me', 'game chat', 'kicked me', 'poor'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'That can be cyberbullying or public shaming. Save screenshots with the name, date, and group if you can see them. Do not reply with insults or post back. A trusted adult can record this in SafeNest, keep the evidence, and decide whether to talk to the school or Childline 116. This is not a finding of guilt — it is a calm next step.',
    };
  }

  if (has(text, ['evidence', 'screenshot', 'save the chat', 'preserve', 'record an incident', 'how do i save'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'Stay calm and do not delete the chat yet. Screenshot the messages, including the name, date, and group if they are visible. Write a short note: which platform, when it started, and how it felt. Then use Report in SafeNest to keep that record in the evidence locker. Do not take over the child’s password. If they are in danger now, call 999, 112, or 116 first.',
    };
  }

  if (has(text, ['school', 'principal', 'teacher', 'headteacher', 'guidance'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'Yes — a trusted adult can take a calm record to the school. Save screenshots and dates first so you are not relying on memory. Ask the child what they want the school to know. Avoid confronting another child or parent in public. SafeNest can store the evidence. Childline 116 can also advise if the school is not the right first step.',
    };
  }

  if (has(text, ['take away the phone', 'confiscat', 'not sleeping', '2am', 'checking his phone', 'checking her phone', 'night'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'Night-time phone checking can mean worry, bullying, or a chat that feels unsafe — or simply habit. Start with “Are you okay? I noticed you were up.” Grabbing the phone in anger often shuts the child down. You can agree a charging place outside the bedroom and still sit together to look at anything upsetting. If they describe harm, save evidence and record it in SafeNest rather than punishing first.',
    };
  }

  if (has(text, ['childline', '116', '1195', 'helpline', '999', 'what number'])) {
    return {
      urgent: false,
      actions: [{ label: 'Trusted help lines', href: '/resources' }, ...ACTIONS],
      reply: 'Childline Kenya 116 is free and open 24 hours for children and caregivers. If someone is in immediate danger, call 999 or 112. For sexual or gender-based harm, 1195 can help. These are official Kenyan numbers, not invented by SafeNest. I am an AI guide — a person on 116 can stay with you if this feels too heavy.',
    };
  }

  if (has(text, ['password', 'take over', 'log in as', 'whatsapp login', 'give me the pin'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'SafeNest never needs a child’s social-media password. Taking over an account in anger can break trust. Better steps: sit together, save evidence, block or report in the app, and ask what support they want. I can walk you through recording an incident without watching their private life.',
    };
  }

  if (has(text, ['talk to my child', 'without blaming', 'shut down', 'what do i say', 'first question'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'Thank them for telling you. Try “Are you safe right now?” and “Would you like me to sit with you while we look at this?” Avoid “Why did you…?” Stay with them, preserve screenshots, and do not retaliate in the chat. Read the caregiver section in Learn, or ask me about the specific messages.',
    };
  }

  if (has(text, ['hello', 'hi ', 'what can you', 'what do you do', 'who are you', 'help me with'])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'I am SafeNest Guide, an AI helper for online safety — not a human counsellor. You can paste a message, describe what happened, or ask how to save evidence, talk to a child, report to school, or use Kenyan help lines (116, 999/112, 1195). If this is an emergency, call 999 or 112.',
    };
  }

  if (has(text, ['uneasy', 'not sure', 'uncomfortable', 'bad feeling', "i don't know what to call"])) {
    return {
      urgent: false,
      actions: ACTIONS,
      reply: 'A bad feeling is enough. You do not have to name it perfectly. You can tell a trusted adult, save anything that made you uneasy, and leave or block the chat. SafeNest can keep a record without deciding anyone is guilty. If you want, describe the platform or paste the words that stuck with you. For a person now, Childline 116 is free.',
    };
  }

  return {
    urgent: false,
    actions: ACTIONS,
    reply: `I read what you wrote, and I can still help even if it is not one of the suggested questions. If this is about something online that felt wrong, save screenshots with the date, tell a trusted adult, and you can record it in SafeNest. If you want a more specific answer, say what platform it was, who was involved in general terms (classmate, stranger, group), and whether anyone asked for photos, secrets, or made a threat. I am an AI guide. For a person now, call Childline 116, or 999/112 if there is immediate danger.`,
  };
}

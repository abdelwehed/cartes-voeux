export interface CardStyle {
  id: string;
  label: string;
  emoji: string;
  tone: string;
  suggestedTitle: string;
  maxWords: number;
}

export const CARD_STYLES: CardStyle[] = [
  {
    id: "birthday",
    label: "Birthday",
    emoji: "🎂",
    tone: "Warm, joyful, a little playful",
    suggestedTitle: "Happy birthday!",
    maxWords: 60,
  },
  {
    id: "thank_you",
    label: "Thank you",
    emoji: "🙏",
    tone: "Sincere and specific about what you are thankful for",
    suggestedTitle: "Thank you!",
    maxWords: 50,
  },
  {
    id: "congratulations",
    label: "Congratulations",
    emoji: "🎉",
    tone: "Enthusiastic and proud",
    suggestedTitle: "Congratulations!",
    maxWords: 50,
  },
  {
    id: "holidays",
    label: "Holiday greetings",
    emoji: "✨",
    tone: "Cosy, kind, forward-looking",
    suggestedTitle: "Happy holidays!",
    maxWords: 70,
  },
  {
    id: "get_well",
    label: "Get well soon",
    emoji: "🌻",
    tone: "Gentle and supportive, never heavy",
    suggestedTitle: "Get well soon",
    maxWords: 40,
  },
];

export const STYLE_IDS = CARD_STYLES.map((s) => s.id) as [string, ...string[]];

export function findStyle(id: string): CardStyle | undefined {
  return CARD_STYLES.find((s) => s.id === id);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function wrap(text: string, width: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && (line + " " + word).length > width) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    lines.push(line);
  }
  return lines;
}

export function renderCard(input: {
  style: CardStyle;
  recipient: string;
  title: string;
  message: string;
  signature?: string;
}): string {
  const { style, recipient, title, message, signature } = input;
  const border = `${style.emoji} ${"═".repeat(34)} ${style.emoji}`;
  const body = [
    border,
    "",
    `   ${title}`,
    `   ${recipient},`,
    "",
    ...wrap(message, 36).map((l) => (l ? `   ${l}` : "")),
    "",
    ...(signature ? [`   — ${signature}`, ""] : []),
    border,
  ];
  return body.join("\n");
}

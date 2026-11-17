// Endpoint MCP « Cartes de vœux » (Vercel Function, runtime Node.js), exposé sur /mcp via vercel.json.
// Tout est dans ce fichier : Vercel gère mal les imports relatifs entre fichiers TypeScript en ESM.
import type { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

// ---------- Styles et rendu ----------
interface CardStyle {
  id: string;
  label: string;
  emoji: string;
  tone: string;
  suggestedTitle: string;
  maxWords: number;
}

const CARD_STYLES: CardStyle[] = [
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

const STYLE_IDS = CARD_STYLES.map((s) => s.id) as [string, ...string[]];

function findStyle(id: string): CardStyle | undefined {
  return CARD_STYLES.find((s) => s.id === id);
}

function countWords(text: string): number {
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

function renderCard(input: {
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

// ---------- Serveur MCP ----------

function buildServer(): McpServer {
  const server = new McpServer({
    name: "cartes-voeux",
    title: "Greeting Cards",
    version: "0.1.1",
  });

  server.registerTool(
    "list_card_styles",
    {
      title: "List greeting card styles",
      description:
        "Returns the available greeting card styles. For each style: its id, label, emoji, " +
        "recommended tone, a suggested title (in English) and the maximum message length in words.",
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => ({
      content: [{ type: "text", text: JSON.stringify(CARD_STYLES, null, 2) }],
      structuredContent: { styles: CARD_STYLES },
    }),
  );

  server.registerTool(
    "create_card",
    {
      title: "Create a greeting card",
      description:
        "Renders a greeting card as formatted text, ready to copy, from a style id, a recipient, " +
        "a title, a message and an optional signature. Returns an error when the message is longer " +
        "than the style's maximum number of words. Nothing is stored or sent elsewhere.",
      inputSchema: {
        style: z.enum(STYLE_IDS).describe("Card style id"),
        recipient: z.string().min(1).max(60).describe("Who the card is for, e.g. 'Dear Marie'"),
        title: z.string().min(1).max(60).describe("Card headline"),
        message: z.string().min(1).max(600).describe("Body of the card"),
        signature: z.string().max(60).optional().describe("Sender name (optional)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ style, recipient, title, message, signature }) => {
      const s = findStyle(style)!;
      const words = countWords(message);
      if (words > s.maxWords) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `The message has ${words} words but the "${s.id}" style allows at most ${s.maxWords}. Shorten it and try again.`,
            },
          ],
        };
      }
      const card = renderCard({ style: s, recipient, title, message, signature });
      return { content: [{ type: "text", text: card }] };
    },
  );

  return server;
}

// ---------- Handler HTTP ----------

// Stateless: a fresh server and transport per request, JSON responses (no SSE stream).
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json", Allow: "POST" }).end(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Method not allowed: this MCP server is stateless, use POST." },
        id: null,
      }),
    );
    return;
  }

  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP request failed", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" }).end(
        JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null }),
      );
    }
  }
}

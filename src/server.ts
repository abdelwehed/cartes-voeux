import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { CARD_STYLES, STYLE_IDS, countWords, findStyle, renderCard } from "./styles.js";

export function buildServer(): McpServer {
  const server = new McpServer({
    name: "cartes-voeux",
    title: "Greeting Cards",
    version: "0.1.0",
  });

  server.registerTool(
    "list_card_styles",
    {
      title: "List greeting card styles",
      description:
        "Lists the available greeting card styles. For each style: its id, label, emoji, " +
        "recommended tone, a suggested title (in English) and the maximum message length in words. " +
        "Call this before create_card to pick a valid style and respect its word limit.",
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
        "Renders a greeting card as formatted text, ready to copy. Requires a style id from " +
        "list_card_styles. The message must not exceed the style's maxWords. Nothing is stored or sent: " +
        "the card is only returned to the conversation.",
      inputSchema: {
        style: z.enum(STYLE_IDS).describe("Style id returned by list_card_styles"),
        recipient: z.string().min(1).max(60).describe("Who the card is for, e.g. 'Dear Marie'"),
        title: z
          .string()
          .min(1)
          .max(60)
          .describe("Card headline, in the user's language (adapt the style's suggestedTitle)"),
        message: z.string().min(1).max(600).describe("Body of the card, in the user's language"),
        signature: z.string().max(60).optional().describe("Sender name, if the user gave one"),
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

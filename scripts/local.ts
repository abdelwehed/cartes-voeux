// Local test server: mimics Vercel by parsing the JSON body, then calls the same handler.
// Usage: npm run dev  ->  http://localhost:3000/mcp
import { createServer } from "node:http";
import handler from "../api/mcp.js";

const PORT = Number(process.env.PORT ?? 3000);

createServer(async (req, res) => {
  if (!req.url?.startsWith("/mcp")) {
    res.writeHead(404).end("Not found");
    return;
  }
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const withBody = Object.assign(req, { body: raw ? JSON.parse(raw) : undefined });
  await handler(withBody, res);
}).listen(PORT, () => console.log(`MCP server listening on http://localhost:${PORT}/mcp`));

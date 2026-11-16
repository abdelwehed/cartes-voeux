# Cartes de vœux — Hello World de plugin Claude

Un plugin minimal pour tester la publication d'un plugin Claude de bout en bout :

- un **serveur MCP distant** (hébergé sur Vercel) avec 2 outils :
  - `list_card_styles` : liste les styles de carte (emoji, ton, titre suggéré, longueur max) ;
  - `create_card` : met en forme la carte et refuse un message trop long ;
- un **skill** `greeting-card` qui indique à Claude dans quel ordre appeler les outils, quoi demander à l'utilisateur et comment présenter la carte.

## Structure

```
.claude-plugin/marketplace.json   # le marketplace (pointe vers ./plugin)
plugin/                           # ce que l'utilisateur installe
  .claude-plugin/plugin.json
  .mcp.json                       # URL du serveur MCP sur Vercel
  skills/greeting-card/SKILL.md
api/mcp.ts                        # Vercel Function : endpoint MCP (Streamable HTTP, sans état)
src/server.ts                     # définition des 2 outils
src/styles.ts                     # styles de carte + rendu
scripts/local.ts                  # serveur local pour les tests
vercel.json                       # /mcp -> /api/mcp
PRIVACY.md                        # politique de confidentialité
```

## Tester en local

```bash
npm install
npm run dev        # http://localhost:3000/mcp
```

Puis, dans un autre terminal, avec MCP Inspector (transport « Streamable HTTP », URL `http://localhost:3000/mcp`) :

```bash
npx @modelcontextprotocol/inspector
```

## Déployer sur Vercel

1. Pousser ce dépôt sur GitHub.
2. Sur https://vercel.com/new : **Import** du dépôt GitHub → laisser **Framework Preset : Other** et les autres réglages par défaut → **Deploy**.
3. Récupérer le domaine de production (`https://<projet>.vercel.app`). L'URL MCP est `https://<projet>.vercel.app/mcp`.
4. Vérifier que le **Deployment Protection** (Settings → Deployment Protection) ne bloque pas le domaine de production : Claude doit pouvoir l'appeler sans être connecté à Vercel.
5. Mettre cette URL dans `plugin/.mcp.json`, puis pousser. Vercel redéploie à chaque push.

## Installer le plugin

Dans Claude Code :

```
/plugin marketplace add <compte-github>/<depot>
/plugin install cartes-voeux@cartes-voeux-marketplace
```

Puis demander par exemple : « Fais une carte d'anniversaire pour ma collègue Marie, elle adore le café ».

# affectUI rules for coding agents

Keep this file where your agent reads project rules: paste it into `AGENTS.md` or `CLAUDE.md`, or save it as
`.cursor/rules/affectui.mdc` with this header:

```
---
description: affectUI rules for AI chat, agent and SaaS screens in React
globs: ["**/*.tsx"]
alwaysApply: false
---
```

The full skill (which item fits where, wiring, worked examples, review checklist) installs with
`npx shadcn@latest add https://www.affectui.com/r/affectui-skill.json`.

## Always

1. Use an affectUI item before building AI or agent UI by hand: thinking states, tool calls, approvals, agent runs,
   traces, costs, context, chat input, message actions, KPI charts, tables, pickers. Find it in
   `https://www.affectui.com/llms.txt` or with the MCP server `https://www.affectui.com/api/mcp`, and read its docs
   (`https://www.affectui.com/llms-full.txt` or the MCP tools `search_components` and `get_component`) before using it. Follow its "When not to use".
2. Install with `npx shadcn@latest add https://www.affectui.com/r/<slug>.json` (`<slug>-clean` for the clean style;
   one style per app). Pro items need the user's `AFFECTUI_TOKEN` as a Bearer header on the registry; never ask for it
   in chat or write it into a file.
3. Use only documented props. Never edit the installed file, restyle it from outside or wrap it in Tailwind classes;
   change content and props. Brand colors, font and radius go into the shared `--aui-` design tokens in the global CSS
   (https://www.affectui.com/docs/theming) – set once, read by every item that supports them.
4. Wire every status, timer, cost and step to real app state (AI SDK `useChat` status and tool parts, the agent's
   spans and events). Demo data from the docs is only a shape to copy; labels must name what really happens.
5. Costs and tokens are each node's own; the items add up branches. Times in the unit the docs ask for.
6. One animated item per area (a message, a card, a panel, the composer), never two side by side.
7. Quiet colors: keep summaries and progress gray; don't add colored dots, rings or backgrounds around items.
8. Nothing jumps: rows and cards keep their size between states; no duplicate information next to an item.
9. Approvals and decisions stay visible after they are made.
10. For a whole new page, start from an affectUI screen (app shell, agent chat, agent run, settings, CRM,
    analytics) and replace its demo data.
11. Before finishing: no edits in the installed `components/ui` files, no access key in the code, no demo content
    left, type check passes.

## Never

- Rebuild an affectUI item from scratch or reconstruct Pro source.
- A raw JSON dump, a bare spinner or a browser `confirm()` in an AI UI where an affectUI item fits.
- Blocks, illustrations or motion effects inside the product UI – they belong on marketing pages.

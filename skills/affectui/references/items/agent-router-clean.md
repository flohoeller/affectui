# Agent Router, clean style (Pro)

A router agent sorting incoming requests to the agents that handle them – the request coming in on top, the router under it and the agents side by side at the bottom, each with its task queue below, all as Agent Crew's cards on its soft blue connectors – people sit off to the right, a fading line with a Human tag. A light runs into the router, which reads the request and settles on an agent with a confidence; the light runs on, the agent's card lights up in its color and the request drops into its queue. Unsure, it hands the request to a person. A click opens why it went where it went, with every agent's score and a way to send it elsewhere

- Page: https://www.affectui.com/components/agent-router
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-router-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-router-clean`

### When to use

- A support inbox, a help desk or any queue where an agent decides which agent – or person – takes each request
- Showing that routing happens and why: the confidence, every agent's score and the reason, one click away
- Live: requests come in, the router reads them and hands them on while you watch

### When not to use

- A lead splitting one task among sub-agents – use Agent Crew or Agent Tree
- One run, message by message – use Agent Sequence
- The requests themselves, to read and answer – use Agent Inbox
- A task passed on from agent to agent – use Agent Handoff

### Usage

```tsx
import { AgentRouter, type RouterAgent, type RouterRequest } from "@/components/ui/agent-router-clean";

const router: RouterAgent = { id: "router", name: "Router", model: "Claude Haiku", status: "active", activity: "Reading “Refund for order #4821”" };

const agents: RouterAgent[] = [
  { id: "billing", name: "Billing", model: "Claude Sonnet", status: "active", activity: "Refunding order #4821", load: 0.45, queue: 2 },
  { id: "tech", name: "Tech support", model: "Claude Sonnet", status: "idle", load: 0.3, queue: 1 },
  { id: "human", name: "Support lead", model: "Human", human: true },
];

const requests: RouterRequest[] = [
  { id: "r1", title: "Refund for order #4821", from: "maria@northwind.io", channel: "email", preview: "I was charged twice…", status: "routed", to: "billing", confidence: 0.94, scores: { billing: 0.94, tech: 0.12 }, reason: "A double charge – billing." },
];

export function Inbox() {
  return <AgentRouter title="Support inbox" router={router} agents={agents} requests={requests} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| router | `RouterAgent` |  | The router itself, in the middle – { id, name, model?, status?, activity? }; its bar shows how sure it is about the request it reads or last sent on |
| agents | `RouterAgent[]` |  | Who it sends requests to – { id, name, model?, status?, activity?, load?, queue?, human?, color?, logo? }. Agents get their pixel mark in a color of the palette, a person (human: true) the full square in ink and an orange glow when a request reaches them |
| requests | `RouterRequest[]` |  | Newest first – { id, title, from?, channel?, icon?, preview?, status, to?, confidence?, scores?, reason?, tags? } |
| tags | `(string \| { label, color? })[]` |  | Per request – up to three small tags on its card in a task queue, gray or tinted with their own color |
| status | `"new" \| "routing" \| "routed" \| "escalated" \| "done"` |  | Per request – routing runs the light into the router and shimmers its line; routed or escalated with to runs it on to that agent, whose card lights up in its color |
| channel / icon | `"email" \| "chat" \| "ticket" \| "call" \| "slack" \| ReactNode` |  | Where the request came in – its icon in the card's tile; icon puts your own there |
| confidence / scores / reason | `number / Record<string, number> / string` |  | How sure the router is (0–1), every agent's score and why – shown on the card and when it is open |
| layout | `"lanes" \| "columns"` |  | lanes (default): the request coming in on top, the router under it, the agents side by side at the bottom, each with its task queue below as in Agent Handoff – a request drops into the queue when the light reaches its agent. People (human: true) get no card: a line out of the router's right side fades out, with a Human tag on it that counts what waits for them. columns: requests, router and agents side by side |
| modelLogo | `ReactNode` |  | Per agent and on the router – the model maker's logo, before the model's name (Claude, OpenAI, Gemini …) |
| max | `number` |  | How many requests show on the left in columns – 4 by default |
| onReroute | `(request, agentId) => void` |  | With it, an open request lists every agent as a button to send it there – update the request's to and the light runs to the new agent |
| onSelect | `(request) => void` |  | A request was opened |
| title | `string` |  | The header's name, with how many are routing, need you and are routed |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: One stop for the whole map
- ← / → / ↑ / ↓: Walk the cards – the request on top, the router, each agent and its task queue
- Home / End: First or last card
- Enter / Space: On a request: opens why it went where it went. On an agent: keeps its requests clear and fades the rest
- Esc: Closes the open request, or clears the agent you look at

### Accessibility

- Every card reads what it is and where it stands – "Refund for order #4821, from maria@northwind.io: Routed, to Billing, 94% sure"
- The open request is a dialog; with onReroute its agents are buttons that say which one it went to
- A polite live region says where each request went
- The connectors and the light are decoration – everything they show is in the cards' labels
- Focus rings show for the keyboard only (:focus-visible), in light and dark

### Motion

- Agent Crew's light runs along a request's connector into the router, then on to the agent it goes to – clear in the middle, fading at both ends; in lanes the request then drops into that agent's task queue
- The card it reaches lights up with the Gradient Floor in that agent's color, rising from the edge the light came in by
- The router's pixel mark twinkles and its line shimmers while it reads; the confidence bar fills as it decides
- Cards rise in and the connectors draw themselves; with prefers-reduced-motion everything changes at once and the light stays off

### Responsive

- Lanes (wide): the request on top, the router, every agent side by side with its task queue – the queues fade out at the bottom and keep one height
- Columns (wide): requests, router and agents side by side, joined by connectors with rounded bends
- Narrow: one column – the requests indented above the router, the agents hanging below it as in Agent Crew; the light runs the same way
- Every card keeps its rows – a long subject, sender or line ends in … with the full text on hover
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give requests and agents stable ids – the light and the open request track them by it
- Move a request through new → routing → routed (or escalated) – each step runs the light once
- Keep titles short – a subject; put the first line of the message in preview
- Route unsure requests to an agent with human: true and status escalated

### Requirements

- React 19

Related: agent-crew, agent-tree, agent-sequence, agent-inbox

# Agent Graph (Pro)

Agents and the tools they call as a living network – a pulse along the link for every call and its answer, busy links growing thicker, agents that breathe while they work and turn amber when they need you

- Page: https://www.affectui.com/components/agent-graph
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-graph.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-graph-clean.json` (needs the Pro access key) – lands as `agent-graph-clean.tsx`, import from `@/components/ui/agent-graph-clean` – its docs: `agent-graph-clean.md`
- Import: `@/components/ui/agent-graph`

### When to use

- A live overview of a multi-agent system: which agents run, which tools and data sources they call, and how busy each link is
- Spotting at a glance who waits for you, which call failed and where the traffic (and the cost) goes
- A hero or status view next to a log or a chat – click a node to see what it does and its latest calls

### When not to use

- Who started whom, with status and cost per sub-agent – use Agent Tree
- When things happened, in time order – use Agent Lanes
- One agent's single tool call in detail – use Tool Call Card
- Graphs with dozens of agents – the orbits are made for a handful of agents and up to a dozen tools

### Usage

```tsx
import { AgentGraph, type GraphNode, type GraphCall } from "@/components/ui/agent-graph";

const nodes: GraphNode[] = [
  { id: "lead", kind: "agent", name: "Orchestrator", detail: "Opus 5.5", status: "working", lead: true },
  { id: "research", kind: "agent", name: "Researcher", detail: "Sonnet 5.5", status: "working", cost: 0.12 },
  { id: "web", kind: "tool", name: "Web search", short: "Search" },
  { id: "notion", kind: "tool", name: "Notion", icon: <NotionLogo /> },
  { id: "you", kind: "user", name: "You" },
];

// Newest last – every new id sends a pulse; when "pending" turns "ok" or "error" the answer travels back
const calls: GraphCall[] = [
  { id: "c1", from: "lead", to: "research", at: Date.now() - 4000, status: "pending", label: "Compare pricing" },
  { id: "c2", from: "research", to: "web", at: Date.now() - 900, status: "ok", ms: 820, label: "pricing linear.app" },
];

export function Live() {
  return <AgentGraph nodes={nodes} calls={calls} edges={[["you", "lead"], ["research", "notion"]]} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| nodes | `GraphNode[]` |  | { id, name, kind, short?, icon?, detail?, status?, doing?, cost?, lead? } – every agent, tool and user; pass the whole list each time, ids keep nodes in place and new ids grow in |
| kind | `"agent" \| "tool" \| "user"` |  | Per node – agents sit on the inner orbit (the lead in the middle), tools and you on the outer one, each turned towards the agents it talks to |
| status | `"idle" \| "working" \| "waiting" \| "error" \| "done"` |  | Per node – working agents breathe, waiting turns amber ("Needs you"), error red; waiting and error also show a chip in the bar |
| short | `string` |  | Per node – a shorter label for narrow containers, e.g. "Search" |
| icon | `ReactNode` |  | Per node – a logo or mark; defaults to the initials (a person for the user) |
| detail / doing | `string` |  | Per node – the model or what a tool is (under the agent's name and in its card), and what it is doing right now (in its card) |
| cost | `number` |  | Per node – what it has cost so far; the bar sums all nodes |
| lead | `boolean` | `first agent` | Per node – the agent in the middle |
| calls | `GraphCall[]` | `[]` | { id, from, to, at, status?, label?, ms? } – recent calls, newest last. A new id sends a pulse from → to; when its status turns "ok" the answer travels back as a hollow dot, "error" comes back red and flashes the link. Calls also create the links they need |
| edges | `[string, string][]` | `[]` | Links that are always there, even before their first call |
| now | `number` | `Date.now()` | The clock for calls per minute and link heat – without it the graph ticks every second |
| heatWindow | `number` | `20000` | How far back (ms) calls count towards a link's thickness – the busiest link is about 4px, a quiet one 1.25px |
| onSelect | `(node: GraphNode \| null) => void` |  | A node was clicked (its card opens) – null when the card closes |
| height | `number` | `fits the width` | Fixed height of the graph in px – by default 0.6 × the width (360–520px) when wide, 1.2 × when narrow |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.42"` | Formats every cost |
| title | `string` | `"Agent graph"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves between the nodes (and the "needs you" / "failed" chips); a focused node lights up its neighbourhood
- Enter / Space: Opens or closes the focused node's card
- Esc: Closes the card and returns focus to its node

### Accessibility

- Every node is a button labelled with its name, kind, status, what it does and its calls in the last minute; aria-expanded tells whether its card is open
- The card is a dialog; its close button takes focus, Esc closes it
- A visually hidden list gives the same picture as text: every node, its status, whom it called how often in the last minute and its cost
- "needs you" and "failed" chips sit in a polite live region, so a waiting or failed agent is announced
- Status is never color alone: waiting and failed agents get a badge (clock, exclamation mark) and a text line under the name

### Motion

- On the first draw the lead pops in, then the agents, then the tools around the orbit – each link draws itself towards the node it reaches
- Every call sends a solid dot with a short tail along its link; the answer comes back as a hollow dot, amber for you, red for an error – the node it lands on ripples once
- Links thicken with use (stroke-width eases over 0.7s) and fade back after six quiet seconds; a link lights up while a pulse runs along it
- Working agents breathe with a soft ring, waiting ones a little quicker in amber
- When nodes come or go every node glides to its new place on a spring – a new tool slides out of the first agent it is linked to; a leaving one shrinks away while its link pulls back
- One requestAnimationFrame loop drives gliding and pulses; it pauses when the graph is off screen or the tab is hidden
- With prefers-reduced-motion nothing glides or travels: a link simply lights up for each call

### Responsive

- The width is measured with a ResizeObserver and the whole layout is computed from it – orbits, node sizes and label room
- Below 520px the graph turns taller than wide, nodes get smaller, labels use their short names, the model line is left out and the card docks to the bottom of the graph
- Labels and the outer orbit always stay inside the panel – nothing is cut off and nothing scrolls sideways, down to 320px
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole nodes and calls arrays every time something changes; a call's id must stay the same while its status goes from pending to ok/error
- Calls older than four seconds when they first appear don't send a pulse – they only count towards heat and calls per minute
- Brand logos are not part of the component – pass them as icon; the UI icons are Hugeicons Free (MIT), keep the credit comment
- The link color is --ui-agg-link (#82bcff), the soft blue of Agent Tree; pulses use --ui-agg-pulse
- Keep it to a handful of agents and about a dozen outer nodes – more get crowded on the outer orbit

### Requirements

- React 19

Related: agent-tree, agent-lanes, tool-call-card, integration-picker

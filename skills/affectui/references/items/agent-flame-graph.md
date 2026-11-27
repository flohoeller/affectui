# Agent Flame Graph (Pro)

A multi-agent run's call stack as a flame graph – the orchestrator on top, then subagents and their LLM and tool calls, every block as wide as it took

- Page: https://www.affectui.com/components/agent-flame-graph
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-flame-graph.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-flame-graph-clean.json` (needs the Pro access key) – lands as `agent-flame-graph-clean.tsx`, import from `@/components/ui/agent-flame-graph-clean` – its docs: `agent-flame-graph-clean.md`
- Import: `@/components/ui/agent-flame-graph`

### When to use

- Seeing where a multi-agent run spent its time, tokens or money – the widest blocks are the answer, at every level
- Digging into one part of a run: click a subagent and it fills the width, with a breadcrumb back to the whole run
- Finding every call to one model or tool across the run – search lights them up and says how much of the run they took
- Watching a run while it works – the right edge keeps growing, failed calls can be retried from their card

### When not to use

- Reading each call's input and output row by row – use Trace Waterfall
- The critical path through parallel work – use Critical Path
- Which agent called which tool, as a network – use Tool Calls Network
- The hierarchy without numbers – use Agent Tree

### Usage

```tsx
import { AgentFlameGraph, type FlameNode } from "@/components/ui/agent-flame-graph";

const run: FlameNode = {
  id: "orchestrator", name: "Orchestrator", kind: "agent", model: "claude-opus-4.5", start: 0, end: 134_000,
  children: [
    {
      id: "coder", name: "Coder", kind: "agent", start: 52_500, end: 123_500,
      children: [
        {
          id: "c-1", name: "claude-sonnet-4.5", kind: "llm", start: 53_000, end: 64_000,
          tokens: 30_900, cost: 0.58, icon: <ClaudeLogo />, detail: "Write the patch for 9 files",
          children: [{ id: "c-1a", name: "github.get_file", kind: "tool", tool: "GitHub", icon: <GitHubLogo />, start: 55_000, end: 56_400 }],
        },
        { id: "t-1", name: "shell.run", kind: "tool", status: "failed", error: "3 tests failed", start: 73_000, end: 80_000 },
      ],
    },
  ],
};

export function Run() {
  return <AgentFlameGraph title="Ship v2.4" root={run} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| root | `FlameNode` |  | The run – { id, name, kind, start, end?, status?, tokens?, cost?, model?, tool?, detail?, error?, icon?, color?, children? } |
| kind | `"agent" \| "llm" \| "tool"` |  | Agents get a quiet gray block with their pixel mark, LLM calls indigo, tool calls teal; failed blocks are red |
| start / end | `number` |  | In ms from the start of the run. Leave end out while it runs; with status "running" an end is how far it reaches for now |
| tokens / cost | `number` |  | A block's own – an agent's children are added on top. NaN and negatives count as nothing |
| icon | `ReactNode` |  | The model maker's or the tool's logo, 12px – also shown in the breadcrumb and the card |
| now / startedAt | `number` |  | The clock in ms from the start, or when the run started (epoch ms) for a clock of its own |
| metric / defaultMetric / onMetricChange | `"time" \| "tokens" \| "cost"` |  | What sizes the blocks – time by default |
| zoomId / defaultZoomId / onZoomChange | `string \| null` |  | The block that fills the width – null for the whole run |
| query / defaultQuery / onQueryChange | `string` |  | The search – matches names, models, tools and details (agents by name) |
| onRetry | `(block: FlameNode) => void` |  | Offers Retry on failed blocks – in their card, or R on a focused failed block |
| title / rootLabel | `string` |  | The heading, and the first crumb of the breadcrumb ("Run") |
| formatCost | `(amount: number) => string` |  | Formats every cost – dollars by default |
| className | `string` |  | An extra class on the root |

### Accessibility

- The graph is a tree with one block in the tab order; every block reads as its name, kind, status, time, tokens and cost
- ← and → move along a row, ↑ goes to the parent, ↓ to the first child, Home to the zoomed block
- Enter or Space zooms into the focused block (or out of the zoomed one); Esc and Backspace zoom out a level from anywhere but the search
- A focused block shows its card; on a failed block Tab moves into the card's Retry button, Shift Tab and Esc go back, R retries without the card
- The Time / Tokens / Cost switch is a radio group – the arrows change it
- The breadcrumb is a nav with the current level marked; the match count is a live status
- The search field firms up its edge instead of a ring; a focus ring shows only for the keyboard

### Motion

- The first picture builds top-down, a row at a time
- Zoom, the metric switch and a rescaling axis glide every block to its new place and width
- Running blocks carry a sweeping sheen and a breathing leading edge; agents' pixel marks twinkle while they run
- The card scales in softly; crumbs slide in
- Reduced motion turns all of it off
- The classic style has a rounder card with a hairline border, pill-shaped switch, search, crumbs and buttons and firmer type – the same behavior as the clean one

### Responsive

- Fills its container's width and never scrolls sideways; the graph keeps a fixed height of 10 rows, deeper trees scroll inside
- Blocks under 40px show no text, names end in …; the number pill shows from 150px
- Narrow: the title and a search button on top, the switch across the width, the breadcrumb collapses to Run › … › last
- On a touch screen a tap zooms and keeps the block's card open until a tap somewhere else
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Build the tree from the trace: agents with their subagents and calls as children, tool calls inside the LLM call that made them
- Give tokens and cost only to the calls that spent them – agents add up their children
- Name LLM blocks by model and tool blocks by tool (github.search_code) – search and the card read them
- Keep children inside their parent's time; siblings that run in parallel overlap in the same row

### Requirements

- React 19

Related: trace-waterfall, critical-path, tool-calls-network, agent-tree

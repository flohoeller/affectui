# Trace Waterfall, clean style (Pro)

Where the time and money of an agent run go – every LLM call, tool call and sub-agent as a bar on a live timeline, with tokens and cost per step, the slowest call marked and branches that fold into their parent

- Page: https://www.affectui.com/components/trace-waterfall
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/trace-waterfall-clean.json` (needs the Pro access key)
- Import: `@/components/ui/trace-waterfall-clean`

### When to use

- Debugging an agent run: how long each step took, where the time and the money went, which call is slow
- A run view next to a chat or a log – every LLM call, tool call and sub-agent as a bar on one timeline
- Live runs, where you want to watch spans start, grow and finish while the agent works

### When not to use

- Who started whom, at a glance – use Agent Tree
- Several agents side by side over the last half hour – use Agent Lanes
- One agent's plan as a checklist – use Agent Plan

### Usage

```tsx
import { TraceWaterfall, type TraceSpan } from "@/components/ui/trace-waterfall-clean";

const run: TraceSpan = {
  id: "run", name: "Orchestrator", kind: "agent", status: "running", start: 0,
  input: "Launch the new pricing page",
  children: [
    { id: "plan", name: "Plan the launch", kind: "llm", model: "Opus 5.5", detail: "Opus 5.5", status: "done",
      start: 900, end: 7800, tokensIn: 3240, tokensOut: 880, cost: 0.115 },
    { id: "search", name: "web_search", kind: "tool", detail: "Linear pricing", status: "running", start: 8100 },
  ],
};

export function Run({ startedAt }: { startedAt: number }) {
  // Times are ms from the start of the run; with startedAt the component keeps its own clock while it runs
  return <TraceWaterfall root={run} startedAt={startedAt} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| root | `TraceSpan` |  | { id, name, kind, status, start, end?, detail?, icon?, model?, tokensIn?, tokensOut?, cost?, input?, output?, error?, children? } – the whole run as a tree, rebuilt as it goes on |
| kind | `"agent" \| "subagent" \| "llm" \| "tool"` |  | Per span – picks the bar's tint: agents slate, LLM calls violet, tool calls teal; failed spans are red |
| status | `"running" \| "done" \| "failed"` |  | Per span – a running span has no end yet and grows into "now" |
| start / end | `number` |  | Per span, in ms from the start of the run; leave end out while it runs |
| detail | `string` |  | Per span – a few muted words after the name, e.g. the model or the query |
| icon | `ReactNode` |  | Per span – a small mark, e.g. the model maker's or the tool's logo; defaults to a swatch in the kind's color |
| cost / tokensIn / tokensOut | `number` |  | Per span, its own – agents add up their children, so don't pre-sum |
| input / output / error | `string` |  | Per span – short previews shown in the details window |
| now | `number` |  | The clock in ms from the start of the run – e.g. a faster one for a demo or a replay |
| startedAt | `number` |  | When the run started (epoch ms) – without now, the component ticks its own clock from here while a span runs |
| collapsed / defaultCollapsed | `string[]` | `[]` | Ids of folded spans, controlled or uncontrolled |
| onCollapsedChange | `(collapsed: string[]) => void` |  | A span was folded or opened |
| openId / defaultOpenId | `string \| null` | `null` | The span whose details are open, controlled or uncontrolled |
| onOpenChange | `(id: string \| null, span?: TraceSpan) => void` |  | Details opened (with the span) or closed |
| markSlowest | `boolean` | `true` | Marks the slowest finished LLM or tool call with a small "Slowest" tag |
| minRange | `number` | `10000` | The shortest time the axis shows, in ms – it grows in round steps as the run gets longer |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.042"` | Formats every cost |
| title | `string` | `"Trace"` | Heading of the bar; next to it the root's input (or name) |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves into the waterfall (one row is in the tab order) and on to the details window
- ArrowUp / ArrowDown: Moves between the rows; Home and End jump to the first and the last
- ArrowRight: Opens a folded span, or moves to its first child
- ArrowLeft: Folds an open span, or moves to its parent
- Enter / Space: Opens or closes the details of the focused span
- Esc: Closes the details

### Accessibility

- The rows are a tree: every span is a treeitem with its level, labelled with name, kind, status, duration and cost; aria-expanded on spans with children
- Roving focus – only one row is in the tab order, so the waterfall is a single stop
- The details window is a dialog labelled with the span's name, with a close button; Esc closes it and returns focus to the row
- The run's state in the bar (Live, Done, Failed) is announced politely when it changes
- Ticks, grid lines and the "now" line are decoration and hidden from assistive tech

### Motion

- New spans slide in as rows and their bars grow from their start point
- A running span grows live, with a sheen and a soft glow at its leading edge; a "now" line moves across
- When the run outgrows the axis, the range glides to the next round value – ticks fade in and out where they are, bars rescale with it, nothing jumps
- Folding closes the children's rows smoothly and shows their calls as small marks on the parent bar; the chevron turns
- Rows that leave – a new run, removed data – close up a beat after each other, bottom first
- The details window opens with a soft scale and fade from the row's bar, and closes the same way
- Numbers that still climb – the duration, cost and tokens of a live run – carry a light shimmer
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query: wide, the span tree sits on the left and the timeline on the right
- Under 560px each row stacks – name, duration and cost on one line, the bar across the whole width under it; the numbers wrap to three columns
- Under 360px the muted detail after each name drops out, so names keep their room
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole tree every time something changes – ids keep rows in place, new ids slide in and grow
- start and end are ms from the run's start, not timestamps – subtract the run's start time from your span times
- cost and tokens are the span's own; agents and sub-agents add their children up
- A retried call is a new span with its own id – keep the failed one, it tells the story
- For a live run pass startedAt (the component ticks) or drive now yourself; once nothing runs, the axis settles on the last end
- Colors are variables on .ui-trwc, e.g. --ui-trwc-llm-bg / --ui-trwc-llm-edge for LLM calls
- The chevron, warning and close icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: agent-tree, agent-lanes, agent-plan, agent-steering

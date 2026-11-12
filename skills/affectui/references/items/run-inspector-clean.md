# Run Inspector, clean style (Pro)

One agent run on one screen – who started whom as a live tree, every agent's calls as small bars on its card, a click opens a call with its error right under its row, and the run's numbers sit on top

- Page: https://www.affectui.com/blocks/run-inspector
- Section: Blocks · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/run-inspector-clean.json` (needs the Pro access key)
- Import: `@/components/ui/run-inspector-clean`

### When to use

- One screen for a multi-agent run: who started whom, what each agent called, what it cost and where it failed
- Debugging or reviewing runs – the failed call is one click away on the card of the agent that made it
- Live runs: pass the spans as they grow and the cards, traces and numbers follow

### When not to use

- A single agent without sub-agents – a Trace Waterfall alone reads faster
- Hundreds of calls per agent – each card shows its first rows; use a full trace view for deep dives

### Usage

```tsx
import { RunInspector, type RunSpan } from "@/components/ui/run-inspector-clean";

const run: RunSpan = {
  id: "main", name: "Orchestrator", kind: "agent", status: "running", start: 0, model: "Opus 5.5",
  task: "Launch the new pricing page by Friday",
  children: [
    { id: "plan", name: "Plan the launch", kind: "llm", status: "done", start: 200, end: 7100, model: "Opus 5.5", tokensIn: 6200, tokensOut: 900, cost: 0.03 },
    {
      id: "coder", name: "Coder", kind: "agent", status: "running", start: 7400, model: "GPT-6 Sol", task: "Build the page",
      children: [
        { id: "tests", name: "Run checkout tests", kind: "tool", status: "failed", start: 9000, end: 17400, tool: "run_tests", args: { command: "pnpm test checkout" }, error: "2 of 14 checkout tests fail" },
      ],
    },
  ],
};

export function RunPage() {
  return <RunInspector run={run} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| run | `RunSpan` |  | The orchestrator with everything under it: sub-agents (kind "agent"), model calls ("llm") and tool calls ("tool") – each { id, name, kind, status, start, end?, model?, icon?, task?, tool?, args?, result?, tokensIn?, tokensOut?, cost?, input?, output?, error?, children? } |
| supervisor | `RunSpan` |  | An agent that watches the run rather than working in it – shown beside the orchestrator, joined by a dashed line |
| now | `number` |  | The run's clock in ms – drives running bars and times; leave it out and it ticks by itself while something runs |
| startedAt | `number` |  | When the run started (epoch ms) – times on the cards count from here |
| selected | `string \| null` |  | Controlled id of the picked agent – the others fade and the numbers sum up its part |
| onSelectedChange | `(id: string \| null) => void` |  | Called when an agent is picked or let go |
| call | `string \| null` |  | Controlled id of the call opened under its row |
| onCallChange | `(id: string \| null) => void` |  | Called when a call is opened or closed |
| formatCost | `(amount: number) => string` | `$0.00` | How amounts are written |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the agent cards and, on each card, its call rows – every stop shows a focus ring
- Enter / Space: On a card, picks the agent (again lets it go); on a call row, opens or closes the call under it
- Esc: On an open call's row, closes it

### Accessibility

- Each card's calls are a list; a row is a button with its name, duration and failure in its label, aria-expanded and aria-controls on the opened details
- The numbers are a description list labelled with what they sum up – the whole run or the picked agent
- The agent count in the title line is announced as it changes

### Motion

- New calls tick in as bars; a running bar carries a sweeping sheen and a glowing leading edge
- Cards grow and shrink smoothly as rows arrive or a call opens – the connectors and the cards below follow every frame
- With prefers-reduced-motion everything changes in one step

### Responsive

- The tree follows its own width: narrow, it stacks the agents as an indented list; the numbers wrap into two rows of three
- The title line and the numbers keep one width (--ui-rinc-details-w, 680px) – they don't follow the agents as they come and go
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: agent-tree, trace-waterfall, tool-call-card

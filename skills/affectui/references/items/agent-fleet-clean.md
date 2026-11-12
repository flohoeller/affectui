# Agent Fleet, clean style (Pro)

Several agents side by side – each card sums up its sub-agents, and a click opens its tree to the right while the last one folds back into its card

- Page: https://www.affectui.com/components/agent-fleet
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-fleet-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-fleet-clean`

### When to use

- Several agents working at the same time – a launch, the support queue, a release – each with sub-agents of its own
- Seeing at a glance which agent needs you, which one failed and what the whole fleet costs – without every tree open at once
- A fleet overview on a dashboard: one tree open, the others folded to a single card

### When not to use

- One run with one orchestrator – use Agent Tree
- When things happened, in time order – use Agent Lanes
- Handing tasks to agents yourself – use Delegate Board

### Usage

```tsx
import { AgentFleet, type FleetAgent } from "@/components/ui/agent-fleet-clean";

const fleet: FleetAgent[] = [
  {
    id: "launch", name: "Launch lead", model: "Opus 5.5", task: "Launch the new pricing page",
    status: "running", cost: 0.42, started: Date.now() - 840_000,
    children: [
      { id: "research", name: "Researcher", task: "Compare five competitors", status: "done", cost: 0.31, started: Date.now() - 780_000, ended: Date.now() - 360_000 },
      { id: "copy", name: "Writer", task: "Write the plan copy", status: "waiting", cost: 0.18, started: Date.now() - 720_000 },
    ],
  },
  { id: "support", name: "Support lead", task: "Answer the open tickets", status: "running", cost: 0.12, started: Date.now() - 1_560_000 },
];

export function Fleet() {
  return <AgentFleet agents={fleet} onSelect={(agent) => openLog(agent.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `FleetAgent[]` |  | { id, name, task, model?, avatar?, tools?, status, steps?, cost?, started?, ended?, children? } – the main agents, each with its sub-agents; pass them again whenever something changes; tools are small marks shown as overlapping tiles before the task |
| steps | `FleetStep[]` |  | Per sub-agent, { title, status?, tool?, took? } – the tasks it worked through; a click on its card opens them in a small window |
| status | `"queued" \| "running" \| "waiting" \| "done" \| "failed" \| "stopped"` |  | Per agent – "waiting" reads "Needs you"; queued and stopped sub-agents and their connectors are muted |
| cost | `number` |  | Per agent, its own cost – a main agent shows its whole branch, the bar the whole fleet |
| open / defaultOpen | `string \| null` | `the first agent` | Id of the main agent whose tree is open, controlled or uncontrolled – null folds them all |
| onOpenChange | `(id: string \| null) => void` |  | An agent was opened – or folded with a second click |
| ask / error | `string` |  | Per sub-agent – what a waiting one needs you to decide, and what went wrong for a failed one; shown at the top of its window above Approve and Reject, or Retry and Dismiss |
| onResolve | `(agent, action: "approve" \| "reject" \| "retry" \| "dismiss") => void` |  | An answer for a sub-agent that needs you or failed – update its status in your data; without it, those cards get no Answer or Resolve button |
| onSelect | `(agent: FleetAgent) => void` |  | A click on a sub-agent – makes the sub-agent cards clickable; one with steps opens its tasks window as well |
| now | `number` | `Date.now()` | The clock for running times – without it the cards tick every second while an agent runs |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.42"` | Formats every cost |
| title | `string` | `"Agents"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Moves between the main agents
- Home / End: Jumps to the first or the last main agent
- Enter / Space: On a main agent: opens its tree, or folds it when it's open – on a sub-agent: opens or closes its tasks window
- Tab: Moves on into the open tree's cards – those with steps, an answer to give or onSelect; in an answer window, Approve or Retry has focus and Tab reaches the other
- Esc: Closes the tasks window and puts focus back on its card

### Accessibility

- Every main agent is a button with aria-expanded, pointing at the open tree with aria-controls
- The open tree is a tree labelled "Sub-agents of …"; every sub-agent is a treeitem labelled with its name and status
- The totals in the bar – agents, running, needs you, cost – are announced politely when they change
- Status is never color alone: every card spells it out, and the phrase under each main agent says what the ring shows
- The small Answer or Resolve button on a card is a pointer shortcut – keyboard users open the same window from the card itself
- A sub-agent with steps, or one that needs you or failed, has aria-haspopup and aria-expanded; its tasks window is a dialog labelled "Tasks of …", closed by Esc or a click elsewhere

### Motion

- The agent you open stays as it is while the others fade back to half – hover brings one forward again
- The open tree leaves first – bottom card first, while its connectors pull back into the card – then the new connectors draw themselves out and the cards rise in one after another
- The tree stands centered on its agent, as far as the column reaches; when it grows while open, it glides to its new place
- Costs that still climb carry a light shimmer
- A sub-agent's tasks window drops down from its card, the tasks fading in one after another
- With prefers-reduced-motion the trees switch at once

### Responsive

- Wide enough for the column, a gap and the deepest tree, the tree opens to the right of the column
- Narrower, the tree opens under its card and pushes the agents below down – and folds back up before the next one opens
- Every card has a fixed height – one line of task, one line of numbers – so nothing jumps when a status changes
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole fleet every time something changes – ids keep the cards in place, a new sub-agent rises in with a drawn connector
- cost is the agent's own spend; the component adds the sub-agents up, so don't pre-sum it
- The phrase under a main agent picks the most urgent thing: needs you, then failed, then running, then done
- The connector color is --ui-agfc-link (#82bcff), the same blue as Agent Tree; how far the other agents fade is --ui-agfc-dim
- The progress circle under a main agent is a ring with a pie inside, like Linear's "In progress": the pie is the share of sub-agents that are through (done, failed or stopped); it's gray, like the phrase next to it, e.g. "2/4 running"
- Steps without a status count as done and show how long they took; the others say where they stand on the right – Running (shimmering), Needs you or Failed in bold, Queued or Skipped faint
- The status glyphs are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: agent-tree, agent-lanes, agent-monitor, delegate-board

# Agent Tree, clean style (Pro)

Who started whom – an orchestrator and its sub-agents as a live tree, with status, cost and time on every card, costs rolling up each branch, and branches that fold to one line

- Page: https://www.affectui.com/components/agent-tree
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-tree-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-tree-clean`

### When to use

- Multi-agent runs where an orchestrator hands parts of a job to sub-agents – and those start their own
- Seeing at a glance which branch is still running, which one waits for you and which one is expensive
- A run overview next to a chat or a log – click a card to open what that agent did

### When not to use

- When things happened, in time order – use Agent Lanes
- One agent's steps – use Agent Plan or Agent Steering
- Handing tasks to agents yourself – use Delegate Board

### Usage

```tsx
import { AgentTree, type TreeAgent } from "@/components/ui/agent-tree-clean";

const run: TreeAgent = {
  id: "lead", name: "Orchestrator", model: "Opus 5.5", task: "Launch the new pricing page",
  status: "running", cost: 0.42, started: Date.now() - 80_000,
  children: [
    { id: "research", name: "Researcher", task: "Compare five competitors", status: "done", cost: 0.29, started: Date.now() - 70_000, ended: Date.now() - 25_000 },
    { id: "build", name: "Coder", task: "Build the page", status: "running", cost: 0.18, started: Date.now() - 60_000 },
  ],
};

export function Run() {
  return <AgentTree root={run} onSelect={(agent) => openLog(agent.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| root | `TreeAgent` |  | { id, name, task, model?, avatar?, tools?, status, ask?, error?, cost?, started?, ended?, children? } – the whole tree, rebuilt as the run goes on; tools are small marks shown as overlapping tiles before the task |
| status | `"queued" \| "running" \| "waiting" \| "done" \| "failed" \| "stopped"` |  | Per agent – "waiting" reads "Needs you"; queued and stopped agents and their connectors are muted |
| cost | `number` |  | Per agent, its own cost – a card with children shows the whole branch |
| collapsed / defaultCollapsed | `string[]` | `[]` | Ids of folded branches, controlled or uncontrolled |
| onCollapsedChange | `(collapsed: string[]) => void` |  | A branch was folded or opened |
| ask / error | `string` |  | Per agent – what a waiting agent needs you to decide, and what went wrong for a failed one; shown in the window behind "needs you" and "failed" |
| onResolve | `(agent, action: "approve" \| "reject" \| "retry" \| "dismiss") => void` |  | An answer from that window – update the agent's status in your data |
| onSelect | `(agent: TreeAgent) => void` |  | A click on a card – makes the cards clickable |
| now | `number` | `Date.now()` | The clock for running times – without it the tree ticks every second while an agent runs |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.42"` | Formats every cost |
| title | `string` | `"Agents"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves between the fold buttons – and the cards, when onSelect is set
- Enter: On a card: selects it (onSelect)
- Enter / Space: Folds or opens the focused branch

### Accessibility

- The tree is a tree with groups; every agent is a treeitem labelled with its name and status, aria-expanded on branches
- Fold buttons name what they do, e.g. "Show 2 sub-agents of Researcher"
- "needs you" and "failed" are buttons with aria-expanded; their window is a dialog, the first answer is focused and Esc closes it
- The totals in the bar – agents, running, needs you, failed, cost – are announced politely when they change

### Motion

- A new agent's connector draws itself from the parent's dot, then the card rises in; several new agents rise one after another
- When the tree changes, every card glides to its new place and the connectors follow frame by frame
- Agents that leave – a folded branch, removed data – fade out a beat apart, bottom first, while their connectors pull back into the parent
- Status glyphs: a spinning loader while running, a check when done, a warning triangle when failed, a clock when it needs you
- Costs that still climb – a running agent, a branch with one, the total – carry a light shimmer that runs over the amount
- With prefers-reduced-motion everything appears at once

### Responsive

- From 560px the first level sits side by side under the root, deeper levels hang below their parent – every card has the same width
- Narrower, every level is indented under its parent and the connectors run down the left; the cards shrink together so the deepest level still fits
- The connectors are measured from the cards, so any width or zoom works
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole tree every time something changes – ids keep the cards in place, new ids grow in with a drawn connector
- cost is the agent's own spend; the component adds the children up, so don't pre-sum it
- A failed agent that gets retried is a new child with its own id – keep the failed one, it tells the story
- The connector color is --ui-agtc-link (#82bcff), the soft blue of the Project Flow illustration
- The chevron is Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: agent-lanes, agent-plan, delegate-board, agent-steering

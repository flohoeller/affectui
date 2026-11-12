# Mission Timeline (Pro)

All agents at a glance on one clock – what happened since you looked on top, every agent on its own lane in the middle, what needs you on the side, and one filter for running, waiting and failed that applies to all three

- Page: https://www.affectui.com/blocks/mission-timeline
- Section: Blocks · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/mission-timeline.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/mission-timeline-clean.json` (needs the Pro access key) – lands as `mission-timeline-clean.tsx`, import from `@/components/ui/mission-timeline-clean` – its docs: `mission-timeline-clean.md`
- Import: `@/components/ui/mission-timeline`

### When to use

- The home of an agent product: everything your agents are doing, what happened since you last looked, and what's waiting on you – on one screen
- Teams that run several agents at once and lose track of what happened when
- A morning check-in: the curve shows when things happened, the inbox what to answer first

### When not to use

- A single agent run – Run Inspector shows one run in depth
- Hundreds of agents – group them first; the middle shows every agent it's given

### Usage

```tsx
import { MissionTimeline, type MissionAgent, type MissionEvent } from "@/components/ui/mission-timeline";

const agents: MissionAgent[] = [
  {
    id: "support", name: "Support lead", model: "Sonnet 5.5", status: "running", task: "Answer the open tickets",
    started: Date.now() - 29 * 60_000, tasks: [{ id: "queue", title: "Answer 38 tickets", status: "running", start: Date.now() - 29 * 60_000 }],
    children: [
      { id: "billing", name: "Billing", status: "failed", task: "Refund $240 to Acme Corp", error: "The card on file expired" },
    ],
  },
];

const events: MissionEvent[] = [
  { id: "e1", agent: "billing", at: Date.now() - 3 * 3_600_000, kind: "failed", title: "Refund to Acme Corp" },
];

export function Home() {
  return <MissionTimeline agents={agents} events={events} since={Date.now() - 8 * 3_600_000} onRetry={(agent) => retry(agent.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `MissionAgent[]` |  | The agents and their sub-agents – each { id, name, model?, avatar?, status, task, ask?, error?, cost?, started?, ended?, tools?, tasks?, children? }. A waiting agent's ask and a failed agent's error land in the inbox |
| events | `MissionEvent[]` |  | What happened since you looked – Agent Recap events plus the agent id they belong to: { id, agent, at, kind: "done" | "needs" | "failed", title, detail?, logo?, count? } |
| since | `number` |  | When you last looked (epoch ms) – the curve on top starts here |
| now | `number` |  | The clock for running times and the end of the curve – defaults to now |
| span | `number` | `30 minutes` | How far back the lanes reach, ms |
| filter | `"all" \| "running" \| "waiting" \| "failed"` |  | Controlled filter – picks agents by status (Needs you counts the agents that ask and the ones that failed); the curve, the middle and the inbox show only them |
| defaultFilter | `MissionFilter` | `"all"` | Uncontrolled start |
| onFilterChange | `(filter: MissionFilter) => void` |  | Called when another filter is picked |
| onApprove / onReject | `(agent: MissionAgent) => void` |  | An answer to a waiting agent, from its inbox card or its card in the lanes – update its status in your data |
| onRetry | `(agent: MissionAgent) => void` |  | Retry for a failed agent, from its inbox card |
| title | `string` | `"Mission timeline"` | Heading above it all |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves to the filter, then through the lanes and the inbox cards – each shows a focus ring
- ← / →: In the filter, picks the previous or next one; Home and End jump to the first and last
- Enter / Space: On an inbox card, opens it with its answer buttons

### Accessibility

- The filter is a radio group labelled “Show agents”, each option with its count
- The summary is a labelled region; the counts and the curve are announced with it
- The inbox cards are buttons with aria-expanded; their answers are real buttons

### Motion

- An answer from any part – the inbox, the lanes – changes the agent everywhere at once: the curve, the middle, the inbox and the filter's counts. It holds until the agent's status changes in your data
- A dot on the curve points at its agent: its lane and its inbox card stay – the rest fades, and comes back when the pointer leaves
- A filter keeps the row as tall as before – the inbox stays the same size and is just emptier, nothing below jumps
- With prefers-reduced-motion everything changes in one step

### Responsive

- Follows its own width: below 860px the inbox goes under the lanes, as tall as it needs
- The lanes keep one clock for all agents – names sit in a fixed column, the blocks on the time axis beside them
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: agent-lanes, agent-inbox, agent-recap, mission-control

# Fan-out Grid, clean style (Pro)

One agent hands a big job to many workers – every task a cell on a live grid that fills in as they get through it, with retries, failures, cost and the time left, and the details of any task on hover

- Page: https://www.affectui.com/components/fan-out-grid
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/fan-out-grid-clean.json` (needs the Pro access key)
- Import: `@/components/ui/fan-out-grid-clean`

### When to use

- An agent fans one job out to many workers – enriching leads, translating pages, labelling tickets, running evals – and you want to watch it fill in
- Batch runs with hundreds of tasks, where retries and failures matter more than any single step
- A live overview next to a run's log: how far it is, what it costs, how long is left

### When not to use

- A handful of agents and who started whom – use Agent Tree
- Where the time of one run goes, step by step – use Trace Waterfall
- Several agents side by side over time – use Agent Lanes

### Usage

```tsx
import { FanoutGrid, type FanoutTask } from "@/components/ui/fan-out-grid-clean";

const tasks: FanoutTask[] = leads.map((lead) => ({
  id: lead.id,
  label: lead.domain,
  status: lead.status, // "queued" | "running" | "retrying" | "done" | "failed"
  worker: lead.worker,
  start: lead.startedMs, end: lead.endedMs,
  cost: lead.cost, attempts: lead.attempts,
  result: lead.summary, error: lead.error,
}));

export function Enrichment({ elapsed }: { elapsed: number }) {
  return <FanoutGrid tasks={tasks} job="Enrich 240 leads" workers={16} now={elapsed} onRetry={(ids) => retry(ids)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | `FanoutTask[]` |  | { id, label, status, worker?, start?, end?, cost?, attempts?, result?, error? } – one per task, in the order the cells should show |
| status | `"queued" \| "running" \| "retrying" \| "done" \| "failed"` |  | Per task – picks the cell's tint: gray, blue with a shine, amber, green, red |
| start / end | `number` |  | Per task, in ms from the start of the job – used for its duration and the time left |
| attempts | `number` |  | Per task – 2 and more show in its details |
| job | `string` |  | What the whole job does, next to the title – e.g. "Enrich 240 leads" |
| workers | `number` |  | How many workers run at once – the time left is worked out from it (defaults to the tasks running now) |
| now | `number` | `0` | The clock, in ms from the start of the job |
| onRetry | `(ids: string[]) => void` |  | Shows "Retry failed" while tasks have failed, and gets their ids |
| onSelect | `(task \| null) => void` |  | A task was picked (click or Enter) – null when it's let go |
| formatCost | `(amount: number) => string` | `dollars` | Formats every cost |
| title | `string` | `"Fan-out"` | Heading of the bar |
| icon | `ReactNode` |  | A small mark before the title, e.g. the agent's logo |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves into the grid (one stop) and on to the counts under it and Retry
- ArrowLeft / ArrowRight / ArrowUp / ArrowDown: Walks the cells and shows each one's details; Home and End jump to the first and the last
- Enter / Space: Keeps the details open, or lets them go
- Esc: Lets go of the details

### Accessibility

- The grid is a single tab stop; the details of the cell you're on are its description
- The counts under the grid are toggle buttons (aria-pressed) that show only one state
- The run's progress is announced politely in steps of ten percent, and once more when it's finished

### Motion

- Cells appear in a quick wave; running ones carry a shine that sweeps across, each a little out of step
- Retrying cells breathe in amber; done and failed cells pop once when they land
- The details window opens with a soft scale and fade from its cell
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query: the grid fills whatever width it gets, the cells wrap into rows
- Under 520px the cells get smaller and the numbers move to a line of their own
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass every task every time something changes – ids keep cells in place, and a cell animates when its status changes
- start and end are ms from the job's start, not timestamps
- The time left needs at least three finished tasks; pass workers for an honest estimate
- A retried task keeps its id – raise attempts and set status back to running
- Colors are variables on .ui-fogc, e.g. --ui-fogc-done-bg / --ui-fogc-done-edge
- The retry icon is Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: agent-tree, trace-waterfall, agent-lanes, agent-queue

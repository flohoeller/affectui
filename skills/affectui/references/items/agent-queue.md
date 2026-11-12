# Agent Queue (Pro)

The work waiting for your agents, and how fast it moves – jobs drop into a live queue, glide into free worker slots as growing bars and land in Done or Failed, while a depth chart shows the backlog build up when a rate limit pauses the workers and drain when they resume

- Page: https://www.affectui.com/components/agent-queue
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-queue.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-queue-clean.json` (needs the Pro access key) – lands as `agent-queue-clean.tsx`, import from `@/components/ui/agent-queue-clean` – its docs: `agent-queue-clean.md`
- Import: `@/components/ui/agent-queue`

### When to use

- A job queue in an agent product – how many tasks wait, which worker runs what, and how fast the backlog moves
- Watching backpressure live: a provider rate-limits, the workers pause, the queue builds up and drains again
- An ops view next to your agents where people can pause the queue, add or remove workers, or move a job to the front

### When not to use

- Several agents side by side over time – use Agent Lanes
- Handing work to a specific agent by hand – use Delegate Board
- A list of background tasks with their results – use Agent Inbox
- Where the time and money of one run go – use Trace Waterfall

### Usage

```tsx
import { AgentQueue, type QueueJob, type QueueWorker } from "@/components/ui/agent-queue";

const workers: QueueWorker[] = [
  { id: "w1", name: "Sonnet 5.5" },
  { id: "w2", name: "GPT-6 Sol" },
];

const jobs: QueueJob[] = [
  { id: "j1", name: "Summarize ticket #4821", kind: "llm", status: "running", worker: "w1",
    enqueuedAt: t0, startedAt: t0 + 1200, progress: 0.4 },
  { id: "j2", name: "Embed 240 docs", kind: "tool", status: "queued", enqueuedAt: t0 + 800 },
  { id: "j3", name: "Draft reply – Acme", kind: "llm", status: "queued", priority: "high", enqueuedAt: t0 + 2100 },
];

export function Jobs() {
  // Times are on one clock (epoch ms here) – without now, the component ticks Date.now while there is work
  return <AgentQueue jobs={jobs} workers={workers} backpressure={20} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| jobs | `QueueJob[]` |  | { id, name, kind, status, enqueuedAt, priority?, startedAt?, endedAt?, worker?, progress?, estimate?, attempt?, maxAttempts?, detail?, icon?, error? } – waiting, running and recently finished jobs |
| kind | `"llm" \| "tool" \| "agent" \| "human"` |  | Per job – picks its tint: LLM calls violet, tool calls teal, sub-agents slate, human review blue |
| status | `"queued" \| "running" \| "done" \| "failed"` |  | Per job – a job that goes from running back to queued with a higher attempt shows as a retry |
| priority | `"high" \| "normal" \| "low"` | `"normal"` | Per job – a high one glides past the others to the front |
| progress / estimate | `number` |  | Per job – 0–1 while it runs, or the expected run time in ms to estimate it |
| workers | `QueueWorker[]` |  | { id, name, detail?, icon? } – the slots; their number is the concurrency |
| now | `number` |  | The clock, on the same scale as the job times – without it, the component keeps its own (Date.now) |
| rateLimits | `{ from, until, label? }[]` |  | Stretches when the provider rate-limits – while one is active the running jobs pause in amber with a countdown |
| paused / onPausedChange | `boolean / (paused) => void` |  | The queue is paused; the handler shows a Pause/Resume button |
| onConcurrencyChange | `(workers: number) => void` |  | Shows a – N + stepper for the number of workers |
| minConcurrency / maxConcurrency | `number` | `1 / 8` | The stepper's range |
| backpressure | `number` |  | A depth that means trouble – a dashed line on the chart; above it Waiting turns amber |
| window | `number` | `120000` | How far back the depth chart looks, in ms |
| totals | `{ done?, failed? }` |  | Counts since the start, when jobs only holds the recent ones |
| openId / defaultOpenId | `string \| null` | `null` | The job whose card is pinned, controlled or uncontrolled |
| onOpenChange | `(id: string \| null, job?: QueueJob) => void` |  | A job's card was pinned or closed |
| onPromote / onCancel | `(job: QueueJob) => void` |  | Show "Move to front" and "Cancel" in a pinned card |
| title / name | `string` | `"Queue"` | Heading, and the queue's name muted next to it |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves into the jobs (one job is in the tab order), then to the card's buttons
- ArrowUp / ArrowDown / ArrowLeft / ArrowRight: Walks through the running jobs, slot by slot, then the queue from the front; Home and End jump to the ends
- Enter / Space: Pins or closes the focused job's card
- Esc: Closes the card

### Accessibility

- Every job is a real button, labelled with its name, kind, how long it waited or ran, its place in line, priority and attempt
- Roving focus – only one job is in the tab order, so the flow is a single stop
- The pinned card is a dialog with a close button; Esc closes it and returns focus to the job
- Rate limits, their end, failures, retries and crossing the backpressure line are announced in a polite live region
- The chart is an image with a text summary: how many wait now, the peak, the average and the rate-limited stretches
- Pause is a toggle button with aria-pressed; the stepper's buttons say what they do and the count is announced

### Motion

- New jobs drop in at the back of the queue; a high-priority job lands at the back first, then glides past the others
- The front job moves into a free worker and becomes a bar that grows with its progress, with a sheen and a glowing front edge
- A finished job turns green for a beat and flies into Done; a failed one shakes red and goes to Failed – or slides back into the queue with a retry badge
- During a rate limit the bars stop and turn amber, a countdown runs out; the chart line climbs, then falls as the queue drains
- The numbers ease to their new value and the chart's scale glides when it changes – one frame loop that sleeps when nothing moves or the queue is off-screen
- With prefers-reduced-motion everything appears in place

### Responsive

- Built on a container query and the measured width: wide, the flow runs left to right – queue, workers, Done and Failed
- Under 600px the flow stacks: queue on top, the workers below (just their marks, the rail gets the room), Done and Failed side by side
- The four numbers wrap to two columns; under 440px Pause and the stepper get a row of their own
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole list every time something changes – ids keep jobs in place and every change glides
- All times are on one clock – epoch ms, or your own (then pass now)
- A retry is the same id going back to "queued" with attempt + 1, a new enqueuedAt and no startedAt or worker
- The chart is computed from the jobs: keep finished jobs for as long as window, or pass totals and accept a shorter history
- Pass progress while a job runs for honest bars; otherwise give an estimate
- Colors are variables on .ui-agq, e.g. --ui-agq-llm-bg / --ui-agq-llm-edge for LLM calls
- The icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: agent-lanes, delegate-board, agent-inbox, trace-waterfall

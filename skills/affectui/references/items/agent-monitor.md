# Agent Monitor (Pro)

One agent at work, as a card – its current step with a clock and the bill so far, a time strip and the finished steps with the logo of each tool, a click on any of them for the details; the exact command when it needs your OK; folds into a small bar with the tools it has used

- Page: https://www.affectui.com/components/agent-monitor
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-monitor.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-monitor-clean.json` (needs the Pro access key) – lands as `agent-monitor-clean.tsx`, import from `@/components/ui/agent-monitor-clean` – its docs: `agent-monitor-clean.md`
- Import: `@/components/ui/agent-monitor`

### When to use

- A dashboard tile or side panel that keeps one agent in view while people do other work – its current step, the clock and the bill so far
- Agents that must ask before they touch something real – a deploy, a release, a refund: the card shows the exact command and takes Allow or Decline from the keyboard
- Runs where it matters which tool the time went to – the time strip and the logos answer that without opening a log

### When not to use

- You need every tool call with its input and output – use Trace Waterfall
- More than one agent works at once – use Agent Lanes or Agent Tree
- Only a single "thinking…" line is needed – a shimmering label is enough

### Usage

```tsx
import { AgentMonitor } from "@/components/ui/agent-monitor";

<AgentMonitor
  state={run.state}                  // "idle" | "running" | "waiting" | "paused" | "finished" | "failed" | "cancelled"
  agent={{ name: "Claude Opus 5.5", role: "Release agent", mark: <ClaudeLogo /> }}
  since={run.since}
  pausedFor={run.pausedFor}
  cost={run.cost}
  steps={[
    { id: "issues", label: "Collected 14 issues", icon: <LinearLogo />, state: "done", took: 1700 },
    { id: "notes", label: "Drafting the release notes", icon: <NotionLogo />, state: "running", since: run.stepSince },
    { id: "build", label: "Build the preview", kind: "run", state: "queued" },
  ]}
  ask={{ title: "Ready to ship", command: "gh release create v3.2.0 --latest", icon: <GitHubLogo /> }}
  outcome={{ note: "v3.2.0 is live · 14 changes" }}
  onPause={() => runs.pause(run.id)}
  onResume={() => runs.resume(run.id)}
  onCancel={() => runs.cancel(run.id)}
  onAllow={() => runs.allow(run.id)}
  onDecline={() => runs.decline(run.id)}
  onRetry={() => runs.retry(run.id)}
  onOpenLog={() => openLog(run.id)}
/>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| state | `"idle" \| "running" \| "waiting" \| "paused" \| "finished" \| "failed" \| "cancelled"` | `"idle"` | Where the run is – a small pill next to the cost: blue Running, amber Needs you, green Finished, red Failed |
| agent | `{ name: string; role?: string; mark?: ReactNode }` | `{ name: "Agent" }` | Who's working: a name, a role or model, and a 16px logo – without one, the name's first letter |
| steps | `AgentRunStep[]` |  | Every step, oldest first: { id, label, kind?, icon?, state: "queued" | "running" | "done" | "failed", since?, took? } – the running one fills the well, finished ones become bars and rows (three rows tall, the rest scroll), queued ones count toward "3/6" |
| icon (step) | `ReactNode` |  | The logo of the tool the step used – GitHub, Linear, Slack, Notion… – shown in its row and in the well |
| tool / detail / output (step) | `string` |  | Fill the step's info card: the tool's name, a sentence on what happened, and the command it ran or the place it touched – a click on the row or its bar opens it |
| kind (step) | `"read" \| "search" \| "edit" \| "run" \| "think" \| "web"` |  | A plain icon for steps without a logo |
| current | `{ label: string; kind?; icon? }` |  | Overrides what the well says while running – by default it's the running step |
| since / until | `number` |  | When the run began and ended (ms) – the clock counts between them |
| pausedFor | `number` | `0` | Time spent paused (ms), left out of the clock so it picks up where it stopped |
| cost | `number` |  | USD spent so far – shimmers while the agent is busy |
| ask | `{ title: string; command?: string; icon?: ReactNode }` |  | While waiting: a short title, the exact command as code, and the logo of the tool it's about to use |
| outcome | `{ added?; removed?; files?; note? }` |  | Once finished: lines added and removed, files touched, or a short note – after "Finished in 19s" |
| error | `string` |  | Once failed: what went wrong, in a few words |
| onAllow / onDecline | `() => void` |  | Allow and Decline while waiting – Enter and Escape do the same while the card has the focus |
| onPause / onResume / onCancel | `() => void` |  | Steer a running or paused run – Pause or Resume and Cancel sit side by side as two small buttons; paused, the clock and the running bar stand still |
| onRetry | `() => void` |  | Try again after a failure |
| onOpenLog | `() => void` |  | Shows Log, to jump to the full trace |
| defaultFolded | `boolean` | `false` | Start folded, as the small bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Fold away, the step list when it scrolls, then the controls at the foot
- ↑ / ↓: On the focused step list: scroll through the finished steps
- Enter: Waiting, with the card focused: Allow
- Escape: Waiting, with the card focused: Decline – with an info card open, it closes the info card and puts the focus back on its row
- Enter / Space: On a step row: open or close its info card, the focus moving to its close button – on the folded bar: open the card, the focus landing on Fold away

### Accessibility

- The card is a labelled region naming the agent, its state and its current step; the folded bar is a button with the same name
- The time strip is one image whose label lists each step with its time; the rows are a list, and the logos are decoration
- Cost and time are labelled in words for screen readers
- Each row is a button with aria-expanded; the info card is a labelled dialog, and a press outside it closes it

### Motion

- A new step rolls into the well from below; the state pill rolls the same way
- A finished step drops into the top of the list and pushes the others down; past three rows the list scrolls, with a soft fade at the edge that has more
- Folded, each tool the agent picks up slides into the stack of logos – the one in use in full color, the earlier ones faded back; point at one and it lifts, with a small label above naming its last step and how long it took
- The running bar grows live with a soft sheen; when waiting, a short amber bar breathes at the end; finished, the strip turns green
- A click on a row or a bar opens the step's info card under it, with a small drop-in; the pair stays lit while it's open
- Point at a bar or a row and its partner lights up while the rest fade back – a bar whose row has scrolled away scrolls it back into view
- Every change of state is a soft swap: the old content fades and shrinks away while the new one fades in, and the room between them eases to the new width – the folded bar's clock and its Needs you, ✓ and Failed tags, and the controls on the tray alike
- Folded, the running clock carries the same soft shimmer as the cost
- With prefers-reduced-motion everything appears at once

### Responsive

- 372px wide (a white card on a gray tray, the controls on the tray), or narrower with its container – long steps and commands end in an ellipsis
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The component only draws – update state, steps, since, pausedFor and cost from your agent's events
- Fill tool, detail and output on each step – a click on it should answer what it did, with what, and how long it took
- Give each step the logo of the tool it calls; steps that only think or edit can go without and get a plain icon
- Rename the running step once it's done ("Drafting the notes" → "Drafted the notes") so rows read as a record

### Requirements

- React 19

Related: trace-waterfall, agent-lanes, permission-request, tool-call-card

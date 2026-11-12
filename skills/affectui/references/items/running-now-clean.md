# Running Now, clean style (Pro)

A live status of background agent tasks for a header or sidebar – one quiet pill, "3 running · 2 need you"; open it for the tasks with a filling ring, the step each is on and its steps, Pause and Resume, and Open on the ones that wait for you

- Page: https://www.affectui.com/components/running-now
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/running-now-clean.json` (needs the Pro access key)
- Import: `@/components/ui/running-now-clean`

### When to use

- An app header or sidebar that should always say what the agents are doing in the background – and whether any of it waits for you
- Pausing, resuming or opening a task from anywhere, without going to a full task list

### When not to use

- The full list of tasks with filters and details – use the Agent / Tasks screen
- One run step by step – use Agent Monitor or Trace Waterfall
- A decision with its context – use Approval Gates or Decision Inbox

### Usage

```tsx
import { RunningNow, type RunningTask } from "@/components/ui/running-now-clean";

const tasks: RunningTask[] = [
  { id: "ingest", title: "Ingest pipeline", step: "Embedding chunks", done: 2, total: 4, state: "running" },
  { id: "refund", title: "Refund review", step: "Approve a $240 refund to Acme", done: 1, total: 3, state: "needs-you" },
  { id: "deps", title: "Dependency upgrade", step: "Running 212 tests", done: 1, total: 4, state: "paused" },
];

export function Header() {
  return (
    <header>
      <RunningNow tasks={tasks} onPause={pause} onResume={resume} onOpen={openTask} onOpenAll={() => navigate("/tasks")} />
    </header>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | `RunningTask[]` |  | { id, title, step, done, total, state } – in the order they should be listed; the list keeps that order, so rows never swap places |
| state | `"running" \| "paused" \| "needs-you" \| "done"` |  | Per task – running shows Pause, paused shows Resume, needs-you shows a badge and Open, done a full blue ring |
| onPause / onResume | `(id) => void` |  | The icon button on a running or paused row |
| onOpen | `(id) => void` |  | A click on a row, or Open on a task that needs you |
| onOpenAll | `() => void` |  | Shows the "Open Tasks" footer and runs on click |
| defaultOpen | `boolean` | `false` | Starts open |
| open / onOpenChange | `boolean / (open) => void` |  | Control the popover from outside |
| align | `"start" \| "end"` | `"end"` | Which edge of the trigger the popover lines up with – end for a header's right side, start for a sidebar |
| labels | `Partial<RunningNowLabels>` |  | Every word: title, running, needsYou, needsYouOne (for exactly one – "1 needs you"; falls back to your needsYou), needsYouBadge, paused, pausedCount (the trigger when only paused tasks are left – "5 paused"), done, pause, resume, open, openAll, empty, idle (nothing at all – "No tasks running") |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter / Space: On the trigger: opens the list and moves to the first task, or closes it
- ↓ / ↑: On the trigger: opens the list and moves to the first or the last task
- ↑ / ↓ / Home / End: Moves between the tasks – from a row or from its button
- Tab: From a task to its Pause, Resume or Open button, then on to the next task
- Esc: Closes the list and puts focus back on the trigger

### Accessibility

- The trigger says the whole summary – "Background tasks: 3 running, 2 need you" – and has aria-haspopup, aria-expanded and aria-controls
- The list is a dialog named "Background tasks"; a click outside or tabbing out of it closes it
- Each row is a button that reads its title, state, step and steps – "Ingest pipeline – running. Embedding chunks. 2 of 4 steps"
- Every icon button names its task – "Pause Ingest pipeline", "Open Refund review – needs you"
- A polite live region says when a task starts waiting for you or finishes
- Focus never drops to the page: Pause and Resume keep it on the same button, and when a task finishes (or leaves the list) it moves to that row or the nearest one
- Focus rings show for the keyboard only (:focus-visible), in light and dark

### Motion

- The ring fills like a pie as the steps go by, and changes color with it – orange, amber, teal, blue once done
- A new step crossfades in place: the old line slides up and out while the new one rises in; the counts in the trigger do the same
- With prefers-reduced-motion everything changes at once

### Responsive

- Every row is 52px in every state – a step that changes, a badge that comes or goes never moves another row
- The popover is 340px wide and never wider than the screen minus 32px, so it fits a 375px phone
- Touch screens get 36px buttons, a 36px trigger and 56px rows
- The list scrolls inside the popover after five and a half rows – the half row shows there is more – and stays clear of short screens
- On a phone narrower than 360px, or with four-digit counts below 420px, the trigger keeps only the numbers when both counts show; its label still reads the full summary
- Right-to-left: the popover lines up with the logical edge, titles and steps follow their own direction
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every task a stable id – the crossfade and the live region track rows by it
- Keep step short and in the present – "Embedding chunks", not "The agent is currently embedding chunks"; for needs-you, write what it waits for
- done and total are steps; with total 0 the ring stays empty
- Paused tasks don't count as running in the trigger
- Colors are variables on .ui-rnc, e.g. --ui-rnc-teal or --ui-rnc-amber; the popover width is --ui-rnc-w

### Requirements

- React 19

Related: agent-monitor, approval-gates, agent-fleet, agent-queue

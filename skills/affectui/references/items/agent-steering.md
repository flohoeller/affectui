# Agent Steering (Pro)

Steer an agent while it works – queue a note for the next step and watch it glide into the plan when the agent picks it up, or interrupt right away

- Page: https://www.affectui.com/components/agent-steering
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-steering.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-steering-clean.json` (needs the Pro access key) – lands as `agent-steering-clean.tsx`, import from `@/components/ui/agent-steering-clean` – its docs: `agent-steering-clean.md`
- Import: `@/components/ui/agent-steering`

### When to use

- An agent runs for a while and people notice something it should do differently – without stopping it
- Long runs where a correction is cheaper at the next step than a restart from scratch
- Showing which instruction changed which step, so the run stays easy to follow later

### When not to use

- Reviewing a plan before the run starts – use Agent Plan
- Many background runs at a glance – use Agent Inbox
- A single yes or no before the agent acts – use Approval Card

### Usage

```tsx
import { useState } from "react";
import { AgentSteering, type SteerNote, type SteerStep } from "@/components/ui/agent-steering";

export function Run({ run }: { run: AgentRun }) {
  const [steps, setSteps] = useState<SteerStep[]>(run.steps);
  const [queue, setQueue] = useState<SteerNote[]>([]);

  // Your agent takes the queue in at the start of each step: move the notes into that step – the glide is automatic
  run.on("step", (index) => {
    setSteps((list) => list.map((s, i) => (i === index ? { ...s, status: "active", notes: queue.map((n) => ({ ...n, picked: "next" })) } : s)));
    setQueue([]);
  });

  return (
    <AgentSteering
      title="Migrate users table"
      agent="Opus 5.5"
      steps={steps}
      queue={queue}
      startedAt={run.startedAt}
      onQueue={(text) => setQueue((q) => [...q, { id: crypto.randomUUID(), text }])}
      onInterrupt={(text, id) => run.interrupt(text, id)}
      onRemove={(id) => setQueue((q) => q.filter((n) => n.id !== id))}
      onPause={() => run.pause()}
      onResume={() => run.resume()}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | What the agent is working on, shown as the heading |
| agent | `string` |  | Name of the agent or model, shown under the title |
| steps | `SteerStep[]` |  | The plan: { id, title, status?, duration?, startedAt?, notes? }. status is "done", "active" or "pending" |
| queue | `SteerNote[]` |  | Notes waiting for the next step: { id, text }. Move one into a step's notes (same id, picked set) and it glides over |
| status | `"running" \| "paused" \| "done"` | `"running"` | The run. Clocks tick while running; when done the field closes |
| startedAt | `number \| Date` |  | When the run started – the header clock ticks from here |
| onQueue | `(text: string) => void` |  | ↵ in the field: add the note to your queue |
| onInterrupt | `(text: string, queuedId?: string) => void` |  | ⌘↵ (Ctrl ↵) in the field, or "Now" on a queued note. Shows the shortcut hint and the Now buttons |
| onRemove | `(id: string) => void` |  | ✕ on a queued note |
| onPause / onResume | `() => void` |  | Shows Pause while running and Resume while paused |
| draft / onDraftChange | `string / (text: string) => void` |  | Controlled field text, e.g. to prefill a suggestion |
| placeholder | `string` | `"Steer the agent…"` | Text in the empty field |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↵: Queues the note for the next step
- ⌘ / ↵: Applies the note to the active step right away (Ctrl ↵ on Windows)
- Shift / ↵: New line in the note
- Esc: Clears the field
- Tab: Moves to Pause, the queued notes' Now and ✕ buttons and the send button

### Accessibility

- The plan is an ordered list labelled "Plan"; the active step has aria-current="step"
- Queuing, interrupting and every note the agent picks up are announced in a polite live region
- The field is labelled "Steer the agent" and described by the shortcut hint below it
- Icon buttons have labels: Pause, Resume, Remove “…”, Queue for the next step

### Motion

- A note the agent takes in glides from the queue into its step (620 ms) and lights up softly once it lands
- The card's height follows its content, so the queue opening and closing never jumps
- The active step spins and shimmers; done steps pop their check in
- With prefers-reduced-motion everything switches instantly and the shimmer stops

### Responsive

- Fills its container up to 460px
- Below 380px the padding gets tighter
- Touch screens get larger buttons
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The component never runs anything itself: it shows steps and queue as passed and reports onQueue / onInterrupt / onRemove
- To show that the agent took a note in, remove it from queue and add it (same id, picked: "next" or "now") to the step's notes in one update
- Give each step a startedAt when it becomes active, so its clock is right after re-renders

### Requirements

- React 19

Related: agent-plan, agent-inbox, tool-call-card, thinking-state

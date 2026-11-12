# Run Controls (Pro)

Every control a running agent needs, in one composer – stop it, resume from the word it stopped at, retry or dismiss, steer it mid-answer or queue what's next, with Chat or Act, permissions and how full the context is

- Page: https://www.affectui.com/components/run-controls
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/run-controls.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/run-controls-clean.json` (needs the Pro access key) – lands as `run-controls-clean.tsx`, import from `@/components/ui/run-controls-clean` – its docs: `run-controls-clean.md`
- Import: `@/components/ui/run-controls`

### When to use

- Chat and agent products where answers take a while and people want to stop, redirect or line up the next ask
- Any streamed answer that should survive a stop or a dropped connection and carry on from where it was

### When not to use

- A long conversation history – this shows the current turn; pair it with your own message list
- Steering a multi-step plan – Agent Steering shows the plan and where a note lands in it

### Usage

```tsx
import { RunControls } from "@/components/ui/run-controls";

export function Assistant({ run, actions }) {
  return (
    <RunControls
      agent={{ id: "travel", name: "Trip planner" }}
      prompt={run.prompt}
      answer={run.answer}            // the text so far
      status={run.status}            // "idle" | "running" | "stopped" | "error" | "done"
      steers={run.steers}            // [{ at: 214, text: "Keep it to three days" }]
      queue={run.queue}              // [{ id: "q1", text: "Add a packing list" }]
      context={run.contextUsed}      // 0–1
      onSend={actions.send}
      onSteer={actions.steer}        // Enter while it runs
      onQueue={actions.queue}        // ⌥ Enter while it runs
      onUnqueue={actions.unqueue}
      onStop={actions.stop}          // Esc
      onResume={actions.resume}      // carry on from the same word
      onRetry={actions.retry}
      onDismiss={actions.dismiss}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agent | `{ id: string; name: string }` | `{ id: "agent", name: "Agent" }` | The agent – its id gives it its own pixel mark |
| prompt | `string` |  | What was asked; without it the run area shows a quiet start |
| answer | `string` |  | The answer so far – it streams in as you update it |
| status | `"idle" \| "running" \| "stopped" \| "error" \| "done"` | `"idle"` | Running shows the caret and Stop; stopped and error show Resume, Retry and Dismiss; done shows Retry |
| steers | `{ at: number; text: string }[]` |  | Notes sent while it ran, drawn into the answer at the character they landed on |
| queue | `{ id: string; text: string }[]` |  | Messages waiting for the run to finish, above the composer |
| mode / defaultMode / onModeChange | `"chat" \| "act"` | `"act"` | Chat only answers; Act may change things – the permission menu only applies there |
| permission / defaultPermission / onPermissionChange | `"ask" \| "edits" \| "full"` | `"ask"` | What the agent may do without asking; Full access turns red |
| context | `number` |  | Share of the context window in use (0–1); orange from 80% |
| took | `number` |  | Seconds the run took, for “Done in 0:14” |
| onSend / onSteer / onQueue | `(text: string) => void` |  | Enter sends when idle; while running Enter steers and ⌥ Enter queues |
| onUnqueue | `(id: string) => void` |  | The × on a queued message |
| onStop / onResume / onRetry / onDismiss | `() => void` |  | The run's controls |
| placeholder | `string` |  | Text in the empty field |
| className | `string` |  | Extra class on the card |

### Keyboard

- Enter: Send – or, while the agent works, steer it now
- ⌥ / Enter: While the agent works: queue the message for after
- Shift / Enter: New line
- Esc: Stop the run (closes the permission menu first)
- ← / →: Switch between Chat and Act
- ↑ / ↓ / Home / End: Move through the permission menu

### Accessibility

- Status changes (Writing, Stopped, Done, queued count) are announced in a polite live region – the streamed words are not, so screen readers aren't flooded
- The field explains its keys through aria-describedby, and changes its label while the agent runs
- Mode is a radio group, permissions a menu of radio items with the current one checked; the permission button keeps its name (Permissions: Ask first) when only its icon shows
- Words are counted with Intl.Segmenter, so “Stopped at 28 words” is right for Japanese or Thai too
- The conversation scrolls on its own and is focusable, so it can be scrolled by keyboard

### Motion

- A steering note drops into the answer where it lands; the caret pulses while the agent writes and its mark twinkles
- Queued messages and a new turn rise in; the buttons swap in place – Send, Stop, Queue and Steer
- Reduced motion turns all of it off

### Responsive

- A gray tray holds the run as a white panel; the queue sits on the tray, the composer below it
- The run keeps one height and scrolls, so the card never grows while it streams
- Up to four queued messages show; more scroll inside the tray, so the composer stops growing
- Long agent names end in an ellipsis with the full name on hover; long links and words wrap instead of widening the card
- On touch screens the Esc hint is hidden – Stop stays a button
- Right-to-left: the layout mirrors, the bubble, menu and indents included
- Below 420px the permission shows only its icon and the context only its ring
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: agent-steering, chat-composer, thinking-state, context-window

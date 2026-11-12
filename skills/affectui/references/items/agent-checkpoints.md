# Agent Checkpoints (Pro)

An agent's run as a line of checkpoints, like git for agents – rewind to any of them and a new attempt branches out of it, while the one it left fades back but stays

- Page: https://www.affectui.com/components/agent-checkpoints
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-checkpoints.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-checkpoints-clean.json` (needs the Pro access key) – lands as `agent-checkpoints-clean.tsx`, import from `@/components/ui/agent-checkpoints-clean` – its docs: `agent-checkpoints-clean.md`
- Import: `@/components/ui/agent-checkpoints`

### When to use

- Long agent runs where a wrong turn shouldn't cost the whole run – rewind to the last good checkpoint and let it try again
- Showing that nothing is lost: an attempt you rewound from stays visible, faded, and you can go back to it
- Coding agents, research agents, anything that saves its state step by step

### When not to use

- Steps of a plan that haven't happened yet – use Agent Plan
- How long each step took against its plan – use Plan vs Actual
- Several agents at once – use Agent Fleet

### Usage

```tsx
import { AgentCheckpoints, type Checkpoint } from "@/components/ui/agent-checkpoints";

const checkpoints: Checkpoint[] = [
  { id: "c1", title: "Read the brief", at: 9_000 },
  { id: "c2", parent: "c1", title: "Built the pricing table", files: 3, at: 64_000 },
  { id: "c3", parent: "c2", title: "Tests failing – 4 of 12", status: "failed", at: 131_000 },
  // A second checkpoint after c2 starts a new attempt
  { id: "c4", parent: "c2", title: "Switched to Stripe Elements", status: "running", at: 169_000 },
];

export function Run() {
  return <AgentCheckpoints checkpoints={checkpoints} head="c4" onRewind={(c) => agent.restoreFrom(c.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| checkpoints | `Checkpoint[]` |  | { id, title, icon?, parent?, status?, at?, files?, cost? } in the order they were taken – pass them again whenever one is added or changes; icon is a small mark before the title, e.g. the logo of the tool it worked with |
| parent | `string` |  | Per checkpoint, the one it follows – a checkpoint whose parent already has a later one starts a new attempt on its own lane |
| status | `"running" \| "done" \| "failed" \| "stopped"` | `"done"` | Per checkpoint – running shimmers, failed gets a badge, stopped means you rewound away while the agent worked toward it |
| head | `string` | `the last checkpoint` | Id of the checkpoint the agent stands on – the way to it is blue, everything off it fades back |
| onRewind | `(checkpoint: Checkpoint) => void` |  | Rewind was pressed – add a new checkpoint with this one as its parent, and move head to it |
| task | `string` |  | What the run is for, next to the title |
| formatTime | `(ms: number) => string` | `0:42 / 1:05` | Formats at |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.42"` | Formats the total in the bar on top |
| title | `string` | `"Checkpoints"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Moves between the checkpoints
- Home / End: Jumps to the first or the last checkpoint
- Enter / Space: Rewinds to the focused checkpoint

### Accessibility

- The checkpoints are an ordered list with one tab stop; the arrow keys move between them
- Every row says its title, its attempt, its status and whether it's current or left behind; the current one has aria-current="step"
- The Rewind button is a pointer shortcut – from the keyboard, Enter on the row does the same
- The count in the bar on top is announced politely when it changes
- Status is never color alone: failed has a badge, stopped says so, the current checkpoint is announced

### Motion

- A new checkpoint rises in, its dot pops and the line to it draws itself down – the card grows smoothly to make room
- A rewind bends a new lane out of the checkpoint you picked and draws it down to the new attempt; the attempt you left turns gray and fades back
- A new checkpoint's dot gets one short glint as it arrives; while the agent works toward it, its title shimmers
- With prefers-reduced-motion everything simply appears

### Responsive

- Every row has a fixed height, so nothing jumps when a checkpoint finishes or fails – Rewind takes the place of files and time
- Past fourteen checkpoints the list scrolls inside the card and keeps the current one in view
- Narrow, the task and the file counts give way first
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Never remove checkpoints after a rewind – add the new one with the rewound-to checkpoint as its parent; the old attempt stays and fades back by itself
- Mark what the agent was working on when you rewind as "stopped"
- Lanes come from parent links alone: the first child keeps its parent's lane, every later child opens a new attempt
- The rail's blue is --ui-ack-link (#82bcff), the same as Agent Tree; how far an attempt left behind fades is --ui-ack-dim

### Requirements

- React 19

Related: agent-plan, plan-vs-actual, agent-tree, agent-ledger

# Delegate Board (Pro)

Hand work to your agents by dragging it onto them – each agent previews its new “busy until” time, or switch to Auto and every new task goes to whoever is free first

- Page: https://www.affectui.com/components/delegate-board
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/delegate-board.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/delegate-board-clean.json` (needs the Pro access key) – lands as `delegate-board-clean.tsx`, import from `@/components/ui/delegate-board-clean` – its docs: `delegate-board-clean.md`
- Import: `@/components/ui/delegate-board`

### When to use

- People hand tasks to a team of agents and want to see who is free and how long each one is busy
- Re-balancing work between agents: move a queued task to someone with more room
- Showing an automatic routing suggestion before it happens (suggestion prop)
- Weighing time against money: a fast, pricey model or a slower, cheaper one (rate on each agent)

### When not to use

- Watching what agents are doing right now over time – use Agent Lanes
- Approving single results – use Approval Card or Agent Inbox
- Assigning people in a project tool – this one is about agents, their models and queues

### Usage

```tsx
import { DelegateBoard, type DelegateAgent, type DelegateTask } from "@/components/ui/delegate-board";

export function Dispatch({ agents, tasks }: { agents: DelegateAgent[]; tasks: DelegateTask[] }) {
  return (
    <DelegateBoard
      agents={agents} // { id, name, model?, avatar?, current? }
      tasks={tasks} // { id, title, estimate, tools?, agentId? } – no agentId: unassigned
      onAssign={(taskId, agentId) => api.assign(taskId, agentId)} // agentId null: back to unassigned
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `DelegateAgent[]` |  | { id, name, model?, avatar?, current?, rate? } – current: minutes left on the task it runs now, for the Busy until time; rate: cost per minute of work, shown after the model, as the price of a hand-off and as the total in the queues |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.60"` | Formats every cost – swap in your currency or credits |
| tasks | `DelegateTask[]` |  | { id, title, estimate (minutes), tools?, agentId? }. In each queue the first task is the running one; past three, a +N chip lists the rest in a tooltip on hover or focus |
| onAssign | `(taskId: string, agentId: string \| null) => void` |  | A drop, a keyboard pick or Auto. null means back to Unassigned. Without it the board moves tasks itself |
| mode / defaultMode | `"auto" \| "manual"` | `"manual"` | Auto hands every unassigned task to the least busy agent, about one a second; Manual waits for a drag. The Auto switch sits in the bar |
| onModeChange | `(mode: DelegateMode) => void` |  | The Auto switch was turned on or off |
| suggestion | `{ taskId, agentId } \| null` |  | A proposed hand-off: the agent lights up and previews its new time, the task is marked |
| now | `number` | `Date.now()` | The clock for the Busy until times |
| title | `string` | `"Delegate"` | Heading in the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter: Picks up the focused task; Enter again hands it to the highlighted agent
- ↑ / ↓: Chooses the agent while a task is picked up
- 1–9: Hands the focused task to that agent at once (the numbers show next to the names)
- Esc: Puts a picked-up task back

### Accessibility

- Unassigned and Agents are labelled sections; every queue is a list named after its agent
- Tasks are buttons described by how to move them; every hand-off is announced politely ("Write release notes → Writer")
- Dragging is never the only way: keyboard pick-up, number keys and Auto do the same; Auto is a switch (role switch) labelled by its word

### Motion

- The dragged card lifts, tilts a little and follows the pointer; the agent under it lights up with its new time
- On drop the card glides and shrinks into the agent's queue; queued chips glide when they move between agents
- In Auto the next task goes out about every second, so each hand-off can be followed
- With prefers-reduced-motion everything moves at once, without glides

### Responsive

- Fills its container up to 720px; below 560px the pile sits above the agents
- Works with touch: cards and chips can be dragged with a finger
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- estimate is in minutes; Busy until adds the agent's current (or its first task's estimate) and every queued task's estimate to now
- To route automatically, set suggestion first so people see it, then call your own assign

### Requirements

- React 19

Related: agent-lanes, agent-inbox, agent-steering, autonomy-dial

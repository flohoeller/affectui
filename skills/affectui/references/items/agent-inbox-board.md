# Agent / Inbox Board (Pro)

Every background task your agents work on, as a board – Needs you, Running, Done – with cards that open on the right to approve, retry or open, and glide to their new column when their state changes

- Page: https://www.affectui.com/screens/agent-inbox-board
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-inbox-board.json` (needs the Pro access key)
- Import: `@/components/ui/agent-inbox-board`

### When to use

- Showing every task your agents run in the background – what needs you, what runs, what is done
- Approving, rejecting or retrying a task right where you see it
- A board for agents next to a board for people – it looks like the Kanban screen

### When not to use

- Answering one question after another – use Agent / Inbox
- Planning work for people – use Kanban
- A record of what agents did – use Agent / Activity

### Usage

```tsx
import { AgentInboxBoardScreen } from "@/components/ui/agent-inbox-board";

export default function Page() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <AgentInboxBoardScreen
      tasks={tasks}                                   // the column follows the status
      agents={[{ id: "builder", name: "Builder", color: "#0190fe" }]}
      onApprove={(task) => api.approve(task.id)}
      onReject={(task) => api.stop(task.id)}
      onRetry={(task) => api.retry(task.id)}
      onOpen={(task) => router.push(`/runs/${task.id}`)}
      onCreate={(task) => api.start(task)}         // from New task
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | `{ id; title; description?; agent; status: "waiting" \| "failed" \| "running" \| "done" \| "stopped"; startedAt?; elapsed?; sources?; tools?; steps?: { label; time? }[] }[]` |  | Every task. Waiting and failed show under Needs you, running under Running, done and stopped under Done. startedAt makes the clock tick while it runs or waits; elapsed is shown once it's done; every step shows on the right when a task is open. Pass a stable array (state) |
| agents | `{ id; name; color? }[]` |  | Who works on them – each gets its pixel mark in its color, and the Agents filter lists them |
| defaultView | `"board" \| "list"` | `"board"` | Board or list when the screen starts |
| defaultOpen | `string \| null` | `"migrate"` | The task open on the right when the screen starts |
| onApprove / onReject / onRetry | `(task) => void` |  | Called from the task on the right – Approve and Reject when it waits, Retry when it failed. The card shows its new state in place, then moves |
| onOpen | `(task) => void` |  | Shows Open on running and done tasks |
| onCreate | `(task) => void` |  | Called with a task started from New task – what it should do and which agent |
| loading | `boolean` |  | Gray cards in place of the tasks, under the real column heads – and the task on the right as gray lines in its own layout |
| empty | `boolean` |  | No tasks at all – one quiet note with New task |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K: From task to task, column by column
- Enter: Open the task on the right
- ← / →: Between Board and List, and between the task tabs
- ⌘ Enter: In New task: start it

### Accessibility

- Each card is a button named with its title, state and agent; the one open on the right is marked current
- A polite live region says how many tasks need you and how many run
- Rings show for the keyboard only and sit on the card's edge, so the scrolling column never cuts them

### Motion

- A task that changes state shows it in place first, then glides to its new column
- The agent's pixel mark twinkles while it runs; a running state ring turns
- With prefers-reduced-motion nothing moves – cards just change column

### Responsive

- Three columns side by side, up to 320px each; Agents, Board / List (two icons with tips) and New task sit right of the tabs; on slim cards the state is its glyph and the time; below 760px the columns stack, and list rows drop their second line
- Below 560px the bar keeps only icons and New task becomes a +
- Touch targets grow to 36px on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-inbox, inbox, kanban, agent-activity

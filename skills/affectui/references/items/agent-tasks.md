# Agent / Tasks (Pro)

Your work as tasks, not agents – a calm list grouped by project, each row a ring, where it is in words and a small Needs you, and a click opens what happened so far and what it made

- Page: https://www.affectui.com/screens/agent-tasks
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-tasks.json` (needs the Pro access key)
- Import: `@/components/ui/agent-tasks`

### When to use

- You talk to one orchestrator in one thread and want to see the work as tasks and projects – however many agents run behind them
- Understanding a task at a glance: where it is, what it made, what happened so far and whether it needs you

### When not to use

- Watching agents, calls and traces – use Agent / Orchestration
- Answering what waits on you – use Agent / Inbox
- Moving issues through stages by hand – use Kanban

### Usage

```tsx
import { AgentTasksScreen } from "@/components/ui/agent-tasks";

export default function Page() {
  const [tasks, setTasks] = useState(initialTasks);
  return (
    <AgentTasksScreen
      tasks={tasks}
      projects={["Northwind", "Platform", "Evalkit"]}
      artifacts={files}
      onCreate={(task) => api.startTask(task.title, task.project)}
      onOpenInbox={(taskId, itemId) => router.push("/inbox?item=" + itemId)} // Decide, and a row's Needs you
      onSelect={(id) => api.markSeen(id)}
      onNavigate={(label) => router.push(routes[label])} // "Inbox", "Agent Orchestration", the sidebar's items
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – with "Agent Orchestration" from Show agents, and with "Inbox" from Decide when there's no onOpenInbox |
| workspace | `string` | `"Fieldwork"` | The workspace in the sidebar |
| tasks | `{ id; title; project; status?: "planning" \| "running" \| "paused"; statusText?; steps?; artifacts?; asks?; needs?; updatedAt; done?; goal?; started?; history?; decided? }[]` |  | Every task. statusText is where it is in words ("Writing the draft") – without it the status and its asks say it; steps { label, done? } fill the ring and show as 2/4; asks are what waits on you in the Inbox (see below) – the amber Needs you counts them; needs is that count for a task without asks listed; updatedAt a timestamp in ms; done lists it under Done ("Done · Tue"); history is what happened so far, newest first; decided { question, answer, at } what you chose for it before. Pass a stable array (state) – the screen follows it when it changes |
| tasks[].asks | `{ id; question; kind?: "decision" \| "pick" \| "approval" \| "question" }[]` |  | What the task waits on you for – the Inbox's items, by their ids there. The row's Needs you counts them (and the sidebar's Inbox count adds them up); the panel shows "1 decision waiting" with the first question and a dark Decide that calls onOpenInbox with its id. The decision itself is made in the Inbox |
| projects | `string[]` | `in the order they appear in tasks` | The projects, in the order their groups show – and the choices for a new task |
| artifacts | `Record<string, { updated?; doc?; table?; sheet?; code?; image?; files?; preview? }>` |  | What each artifact shows in its tab, by file name – the App Shell's viewers: a document you write in, a sheet with formulas, a folder, code or an image |
| defaultTab | `"active" \| "done"` | `"active"` | The list the screen opens with |
| defaultSelected | `string \| null` | `"ingest"` | The task open on the right when the screen starts |
| onSelect | `(id: string) => void` |  | Called when a task is opened |
| onCreate | `(task: AgentTask) => void` |  | Called with a new task – it lists at the top of its project, planning, with a dashed ring |
| onOpenInbox | `(taskId: string, itemId?: string) => void` |  | Called with the panel's Decide and a row's Needs you badge – open the Inbox at that item (the agent Inbox's defaultSelected). Without it the screen calls onNavigate("Inbox") |
| onOpenArtifact | `(task: string, name: string) => void` |  | Called when an artifact opens in its own tab of the Task panel |
| onArtifactChange | `(name: string, artifact: ShellArtifact) => void` |  | Called with the whole artifact whenever you change it in its tab – the screen keeps the change while it lives; save it here |
| suggested | `WorkspaceSource[]` | `a few of the artifacts` | Suggested in a New tab of the Task panel (the + after its tabs) – one with an artifact opens it in that tab |
| labels | `{ tasks?; active?; done?; newTask?; create?; placeholder?; needsYou?; decide?; decisionOne?; decisionMany?; showAgents?; happened?; … }` |  | Labels, e.g. for a translation |
| loading | `boolean` |  | While your tasks load: gray rows in the list and gray lines in the Task panel, in the shape of the real ones (the shared Skeleton) |
| empty | `boolean` |  | No tasks at all: Active shows No active tasks with a sentence on how to start and a New task button that opens the new-task line, Done shows Nothing done yet, and the Task panel shows nothing open |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K: Next and previous row – anywhere in the screen, as long as you're not typing
- ↑ / ↓ / Home / End: In the list: move through the group heads and rows (one Tab stop)
- Enter / Space: On a row: open the task on the right – on one that needs you, its Decide is the next Tab stop. On a group's head: fold or unfold it
- ← / →: On a group's head: fold, unfold (→ on an open one steps into it). On a row, ← goes to its group's head
- C / N: New task – type what you want, Enter creates it and clears the line for the next one, Esc closes it
- ← →: Active / Done: switch between the two lists
- ← → / Home / End / Delete: Task panel tabs: move between them; Delete closes the focused tab – closing the last one folds the panel
- Shift F10 / Context menu key: In an artifact's tab: the App Shell's context menus – the sheet, document and folder keep their own shortcuts

### Accessibility

- The list is a role="tree": group heads are level-1 items with aria-expanded and their count, rows level-2 items with their position in the group; one Tab stop, the arrow keys move it
- Every row is named in full – title, where it is, Needs you, steps, artifacts and when it last moved – while the faint columns stay hidden from screen readers
- A polite live region says what happened: "Task created in Northwind"
- The Needs you badge on a row is a pointer's shortcut to the Inbox; the keyboard reaches the same through Enter on the row, then the panel's Decide (named with its question)
- Shortcuts are listed on their buttons (aria-keyshortcuts) and never fire while you type or inside a menu
- One focus ring – 2px accent, following the corners – for the keyboard only: rows and heads show it while you move through the list with Tab, the arrows, J / K, Home or End, and lose it with a pointer; it sits inset in the list and the panel, so no scroller cuts it
- Text fields never get a ring – the caret and a firmer edge say it; a focus moved for you (after a click, Esc back to New task) paints none until the keyboard moves on
- Long titles end in '…' with the full text in a tooltip; right-to-left text reads in its own direction
- The project picker is the App Shell's menu – every item with an icon, the chosen one checked, Esc closes it and hands the focus back
- The Task panel is the App Shell's work area: a tablist whose every tab has a labelled ×; the viewers, toolbars and menus are the App Shell's

### Motion

- One moment: a new task glides in at the top of its project, its row growing from nothing
- The new-task line drops in softly; a group's chevron turns as it folds
- With prefers-reduced-motion nothing glides – the row is simply there

### Responsive

- Fills its container – give it the full viewport height in your app
- Rows have one fixed height; steps, artifacts and time sit in fixed columns so they line up; the status words give way before the title does
- Below 900px the head shares one centerline with the App Shell's corner buttons – title, count, Active / Done and + all on it
- Below 560px each row takes two lines – the title, and where it is under it – and the counts make room; a row opens its task in the App Shell's sheet from the right
- Touch targets grow to 36px and shortcut hints hide on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: inbox, agent-orchestration, kanban

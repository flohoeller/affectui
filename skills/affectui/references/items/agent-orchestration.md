# Agent / Orchestration (Pro)

A live multi-agent run as a tree on a canvas – watch work flow to the running agents, follow every call in the trace below and open an agent for its tasks, context and cost

- Page: https://www.affectui.com/screens/agent-orchestration
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-orchestration.json` (needs the Pro access key)
- Import: `@/components/ui/agent-orchestration`

### When to use

- Watching a multi-agent run live – who started whom, what runs, what waits for you and what it costs so far
- Debugging a finished run: which agent took the time, which burned the tokens, where it failed and what retried

### When not to use

- One agent with a few tool calls – use Trace Waterfall or Agent Run
- Building the flow by hand – use Workflow Builder

### Usage

```tsx
import { AgentOrchestrationScreen } from "@/components/ui/agent-orchestration";

export default function Page() {
  return (
    <AgentOrchestrationScreen
      project="Market research"
      runId={run.id}
      agents={run.agents}
      events={run.events}
      elapsed={run.elapsed}
      onResolve={(agent, answer) => api.answer(run.id, agent.id, answer)}
      onRunControl={(action) => api.control(run.id, action)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar |
| project | `string` | `"Market research"` | Project in the path |
| runId | `string` | `"run_8f3a2c"` | The run in the path – its menu lists earlier runs, Compare, Copy run ID and Download trace |
| agents | `{ id; parent?; name; role; task; model; maker?; mark?; tools?; status; start?; end?; tokensIn?; tokensOut?; tokensCached?; cost?; rate?; ask?; error?; retryOf?; tasks?; context? }[]` |  | Every agent – the one without a parent is the orchestrator on top. status is queued, running, waiting, done, failed or stopped; start and end in ms from the start of the run; cost is its own, the branch is summed up; rate { tokens, cost } per second keeps a running agent ticking; ask is what a waiting agent asks you, error what failed, retryOf the agent it retries; tasks are the items of its task list |
| tools | `{ id; label; icon }[]` |  | The tools agents call – the icons are the tiles on the cards and the rows in the panel |
| spans | `{ id; agent; name; kind: "agent" \| "llm" \| "tool"; start; end?; status; detail? }[]` |  | The trace's bars – made up from each agent's tasks when left out (an LLM call, then the tool call, per task) |
| events | `{ id; at; agent; type: "start" \| "handoff" \| "tool" \| "approval" \| "error" \| "retry" \| "done"; text }[]` |  | What happened – each one shows under Events once the run's clock reaches its at |
| elapsed | `number` | `94000` | How far the run is when the screen opens, in ms – the figures in agents describe this moment |
| live | `boolean` | `true` | Whether the clock runs on – running agents keep adding time, tokens and cost; false opens it paused |
| defaultTab | `"Trace" \| "Tokens & cost" \| "Events"` | `"Trace"` | The run panel's tab when the screen opens |
| onSelect | `(agent: AoAgent \| null) => void` |  | Called when an agent's panel opens, and with null when it closes |
| onResolve | `(agent: AoAgent, answer: "approve" \| "reject") => void` |  | An answer to an agent that waits for you – Approve lets it go on, Reject stops its branch |
| onRunControl | `(action: "start" \| "pause" \| "resume" \| "stop" \| "restart") => void` |  | Start run (in the empty state), Pause run, Resume, Stop and Run again on the top right |
| labels | `{ start?; pause?; resume?; stop?; restart? }` |  | Labels, e.g. for a translation |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the run loads: gray cards on the canvas in the tree's shape – the same sizes, places and gray lines – gray rows in the run panel's open tab and no figures in its head (the shared Skeleton); the clock waits and nothing flows, then the run starts from elapsed |
| empty | `boolean` |  | A run that hasn't started: an empty canvas with one centered “Start the run” and a Start run button (also on the top right, in place of Pause and Stop), the run panel's own empty states and a clock that waits at zero |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Sidebar → path bar → run controls → canvas (one stop) → toolbar → run panel (resize edge, tabs, fold, the open tab's rows – one stop) → the agent's panel when open (close, tabs, the tab's content)
- ↑ / ↓: Canvas: ↑ the agent that started it, ↓ the first one it started – on a leaf, the nearest card below; with the panel open it follows
- ← / →: Canvas: the agents beside it with the same parent – past the last one, the nearest card that way. Toolbar: the next or previous button
- Alt ← / Alt → / Alt ↑ / Alt ↓: Canvas: pan the view without a pointer (Alt Shift: further)
- Home / End: Canvas: the orchestrator, the last agent. Toolbar: its first and last button. Trace, Tokens & cost and Events: the first and last row
- Enter / Space: Open the focused agent's panel (focus moves into it); on a row in the run panel, open that row's agent – the focus stays on the row, on a phone it moves into the sheet
- → / ←: Trace: → shows an agent's LLM and tool calls, then steps onto the first; ← folds them, then goes to the agent that started it; ← on a call goes back to its agent
- Enter / Space / ↓: Path bar: open the project or run menu – the arrows and Home / End move in it, Esc closes it with the focus back on its button
- + / - / ⇧1: Zoom in, zoom out, fit to view
- ↑ / ↓ / Home / End: On the run panel's top edge: resize it (Shift: bigger steps), Home / End for the smallest / largest
- Esc: Close the agent's panel – focus goes back where it came from: the card, or the trace, cost or event row it was opened from

### Accessibility

- The canvas is a tree and one Tab stop (a roving tabindex): the focused agent – or the orchestrator – takes Tab, the arrows follow the tree, so 40 agents are never 40 stops
- Every card is a labelled tree item that says its name, role, status and who started it, its place among the agents with the same parent and whether it started any; the opened one is selected
- The run panel's tabs and the agent panel's tabs are one stop each with arrows; Trace is a tree, Tokens & cost a table with row headers, Events an ordered list – each list one Tab stop, every row named in full (time, agent, kind, text)
- The agent panel's content is a Tab stop of its own, so a long task list scrolls from the keyboard
- Status always comes with words – Running, Needs you, Done, Failed, Queued, Stopped – the colour only repeats it; the error count on Events is read as 'Events, 1 error'
- The focus is never dropped: Stop and Run again swap their buttons and the focus moves to the one that takes the place; an answered approval moves it to the panel's open tab while the toast says what happened; the clock's ticks and new events leave it where it is
- Every control shows the accent focus ring for the keyboard only (:focus-visible) – inset where a scroller would cut it, and a focused row never hides under the trace's axis or the table's head; toolbar buttons have labels and a tooltip with their shortcut
- On phones the agent's panel is a sheet that takes the focus however it opens and keeps it inside until it closes
- Long names, roles and translated control labels end in '…' with the full text in a tooltip; names in right-to-left scripts read in their own direction; tokens and durations roll up (84.2K, 1m 34s, 1d 3h); a figure that was left out shows '–', never 0

### Motion

- Toward every running agent a gradient keeps flowing along its connector, from the parent to the child – the one motion on the canvas
- In the trace, running bars grow with the clock, a sheen sweeps along them and their leading edge glows; the now line moves with them; new bars grow in from their start
- The dot grid pans and zooms with the canvas – its spacing follows the zoom, the dots keep their size
- Opening an agent fades the others and glides the view so its card stays clear of the panel – never zooms; the panel slides in from the right
- New events rise in at the top of Events; figures change in place, in fixed widths, so nothing jumps
- Pause freezes the clock, the flows and the sheens where they are
- With prefers-reduced-motion there is no flow along the connectors, no sheen and nothing slides

### Responsive

- Fills its container – give it the full viewport height in your app
- The tree opens at 80% or more and starts at the top when it's taller than the canvas; Fit to view never zooms past 100%
- Pan by dragging, with a plain wheel or two fingers; zoom with the toolbar, ⌘/Ctrl + wheel or a pinch. A plain wheel pans right away when the canvas fills a page that doesn't scroll; in a longer page, once you've clicked into it
- The run panel stays open under the canvas – drag its top edge, or fold it to a slim bar; the canvas keeps its zoom and place either way
- Below 640px the agent's panel becomes a sheet from the bottom, the run controls and tabs turn into icons, the trace and the cost table keep the columns that matter; touch targets grow to 36px
- Beside the open panel, when the top bar runs short, the run controls turn into icons too, so the path keeps its words
- The trace's axis grows with the run – seconds, minutes, then hours and days – and keeps as many ticks as it has room for
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)
- Context Map (installed with it)

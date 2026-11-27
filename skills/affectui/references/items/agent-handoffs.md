# Agent Run / Handoffs (Pro)

One agent run as swimlanes – a lane per person, agent and tool, every handoff as an arrow and a row, approvals you decide right on the page

- Page: https://www.affectui.com/screens/agent-handoffs
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-handoffs.json` (needs the Pro access key)
- Import: `@/components/ui/agent-handoffs`

### When to use

- The detail page of one agent run where several agents, people and tools pass work along – who did what, and where it changed hands
- Runs that stop for a person's approval – its handoff is flagged in the history with Approve and Reject right in the row, and the diamond's card asks too

### When not to use

- A run as a time axis with bars – use Agent Run / Detail or Trace Waterfall
- One agent's tool calls – use Agent / Tool Calls

### Usage

```tsx
import { AgentHandoffsScreen } from "@/components/ui/agent-handoffs";

export default function Page() {
  return (
    <AgentHandoffsScreen
      title="Ship the billing fix"
      runId="1284"
      lanes={lanes} // [{ id, name, kind?: "person" | "agent" | "tool", role?, logo?, color?, description? }]
      tasks={tasks} // [{ id, lane, title, kind?, after?, status?, duration?, detail?, output?, at? }]
      step={currentStep}
      onApprove={(task) => approve(task.id)}
      onReject={(task) => reject(task.id)}
      onStop={() => stopRun()}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | `"Ship the billing fix"` | The run's name in the head |
| runId | `string` |  | Its number, in the breadcrumb and the menu |
| lanes | `SwimLane[]` |  | A lane per person, agent and tool – see Handoff Swimlanes |
| tasks | `ArhTask[]` |  | The tasks in order – a Swimlanes task plus `output` (what the next one gets, shown as what changed hands) and `at` (when it started) |
| steps | `{ done; active; waiting? }[]` |  | The run step by step, as lists of task ids – the sample plays them and holds at an approval |
| step | `number` |  | Pins the run to one step instead of playing it – pass your live state here |
| onApprove / onReject | `(task) => void` |  | An approval decided – from the flagged row in the history or the diamond's card |
| onStop | `() => void` |  | Stop run |
| loading | `boolean` |  | Gray head, lanes and rows |
| empty | `boolean` |  | The run hasn't started – a note in place of the diagram |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the diagram's lanes and tasks, then the rows and a flagged row's Approve and Reject
- ↑ / ↓: From row to row
- ↑ / ↓: On the line above the handoffs: more or less room for them (with Shift in bigger steps); Home and End for the most and the least – a double click resets it
- Enter: On a row: open or close it – who gave and who took the work, what each did, its state and time; on a task in the diagram: its card
- Esc: Closes a task's card

### Accessibility

- The run's state is a status – it is read out when it changes to waiting, shipped or stopped
- Each row is named with from, to, what changed hands, its state and time, and tells whether it is open
- The diagram is the library's Handoff Swimlanes – every task is a button named with its lane and state
- Rings show for the keyboard only – inside the edge for rows

### Motion

- The sample run plays itself step by step and holds at the approval until you decide
- The newest handoff grows in at the top, so the rows below glide down; an opened row folds out by its height; a running agent's pixel mark twinkles in its row
- All of it stops with reduced motion

### Responsive

- The diagram shows whole and the handoffs fill the rest of the page; drag the line between them to give the handoffs more room – the lanes then scroll inside
- The table drops its state column on narrower screens, and what changed hands on phones; an opened row stacks its two sides
- On phones a flagged row's Approve and Reject go full width; the diagram scales down to fit its card
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell and Handoff Swimlanes (installed with it)

Related: handoff-swimlanes, agent-run-detail, agent-run, agent-orchestration

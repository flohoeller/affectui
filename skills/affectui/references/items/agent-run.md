# AI Chat / Run (Pro)

One autonomous agent run: the plan ticking through its steps, the tool calls, an approval it waits on and the draft it wrote

- Page: https://www.affectui.com/screens/agent-run
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-run.json` (needs the Pro access key)
- Import: `@/components/ui/agent-run`

### When to use

- The detail view of one autonomous agent run – a background task, a scheduled job, a long workflow
- Runs that pause for a human before they send, pay or publish something

### When not to use

- Back-and-forth conversations with the agent – use AI Chat / Agents
- A list of many runs – use a table with a status column

### Usage

```tsx
import { AgentRunScreen } from "@/components/ui/agent-run";

export default function Page() {
  return (
    <AgentRunScreen
      title="Prepare the Q3 board update"
      steps={run.steps}
      draft={{ original: memo.before, suggested: memo.after, label: "Board memo – Q3" }}
      onApprove={(stepId) => api.approve(run.id, stepId)}
      onDeny={(stepId) => api.deny(run.id, stepId)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | `"Prepare the Q3 board update"` | Goal of the run, in the header and above the plan |
| steps | `RunStep[]` | `defaultRunSteps` | Steps with id, title, detail, tool, their tool calls ({ name, summary, icon?, args?, result?, duration }) and an optional approval ({ title, description, risk, details }) the run waits on |
| draft | `{ original: string; suggested: string; label?: string }` | `defaultRunDraft` | Text the agent wrote, shown as an inline diff in the work area |
| files | `Record<string, ShellArtifact>` | `defaultRunFiles` | What the run wrote and pulled, by file name – listed under Files on the right; each opens in its own tab of the work area (doc, table, code, image or folder, like the App Shell's artifacts) |
| agent | `string` | `"Board prep"` | Name of the agent in the run details |
| autoRun | `boolean` | `true` | Plays the built-in simulation on mount – turn off and drive the steps from your own events |
| onApprove | `(stepId: string) => void` |  | An approval was given; the run carries on |
| onDeny | `(stepId: string) => void` |  | An approval was denied; the run stops at that step |
| onStop | `() => void` |  | Stop run pressed |
| onDone | `() => void` |  | Every step is done |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the run loads from history: gray placeholders for the run's name and figures, the plan, the activity, the approval, the draft and the files, in the shape of the real ones (the shared Skeleton) – the simulation and the clock wait until it has landed |
| empty | `boolean` |  | No run yet: the bar stays, the middle shows “No runs yet” with a short line and a New run button that opens Chat, the panel says nothing needs you; the simulation, the clock and onDone wait; loading wins when both are on |
| className | `string` |  | Extra class on the root |

### Accessibility

- Sidebar items, the run actions and the panel toggle are real buttons with labels
- The plan marks the current step with aria-current and announces progress; tool calls and approvals announce their status
- Approve and deny work from the keyboard (⌘↵ / Esc), the diff with Tab, Y and N
- The work area's first tab is Needs your input (with its count); the run's files open in tabs of their own – the tabs are a tablist, ← → move, Delete closes the focused tab, closing the last folds the work area
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app; the run and the work area on the right scroll on their own
- The work area is the App Shell's: resizable, folds away to an icon at the bar's end, and becomes a drawer on narrow screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell Inset, Agent Plan, Tool Call Card, Approval Card, Inline Diff, Thinking Loader and Button (installed with it)

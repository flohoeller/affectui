# Agent Inbox (Pro)

All your background agent tasks in one calm list – live clocks and status tags, filter tabs with rolling counts, rows that unfold to the last steps with Approve, Reject, Retry or Open, and glide to their new place

- Page: https://www.affectui.com/components/agent-inbox
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-inbox.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-inbox-clean.json` (needs the Pro access key) – lands as `agent-inbox-clean.tsx`, import from `@/components/ui/agent-inbox-clean` – its docs: `agent-inbox-clean.md`
- Import: `@/components/ui/agent-inbox`

### When to use

- Agent products where several tasks run in the background and people come back to see what finished, what failed and what waits for them
- A home screen or dashboard that collects approvals from many runs in one calm board, instead of one modal per agent
- Job queues in general – imports, syncs, evaluations – where each job has a short description, a short history and one next step

### When not to use

- One single approval in the flow of a chat – use Approval Card
- The plan of one run, step by step – use Agent Plan; for a single tool call use Tool Call Card
- Hundreds of jobs – the board is for a few dozen at most; page or search a bigger queue in a table

### Usage

```tsx
import { AgentInbox } from "@/components/ui/agent-inbox";

export function Tasks() {
  return (
    <AgentInbox
      tasks={[
        {
          id: "migrate",
          title: "Migrate users table",
          description: "Split users into accounts and profiles. The dry run on staging passed.",
          agent: "Opus 5.5",
          status: "waiting",
          startedAt: Date.now() - 6 * 60_000,
          tools: 14,
          sources: 9,
          steps: [
            { label: "Dry run on staging – no errors", time: "2m ago" },
            { label: "Wants to run it on production", time: "1m ago" },
          ],
        },
        { id: "notes", title: "Release notes v2.4", agent: "Sonnet 5.5", status: "running", startedAt: Date.now() - 80_000 },
        { id: "digest", title: "Weekly metrics digest", agent: "Haiku 5.5", status: "done", elapsed: 252_000 },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | `AgentTask[]` |  | { id, title, description?, agent, status, startedAt?, elapsed?, tools?, sources?, steps? } – status is "running", "waiting", "done" or "failed"; steps are { label, time? }, oldest first |
| onApprove | `(task: AgentTask) => void` |  | Approve on a waiting task. Without it the task turns running inside the board |
| onReject | `(task: AgentTask) => void` |  | Reject on a waiting task. Without it the task turns failed |
| onRetry | `(task: AgentTask) => void` |  | Retry on a failed task. Without it the task runs again and its clock starts over |
| onOpen | `(task: AgentTask) => void` |  | Shows an Open button on running and done tasks |
| title | `string` | `"Agent inbox"` | Heading on the left of the bar, after "Agents /" |
| action | `{ label: string; onClick: () => void }` |  | A button in the bar next to the layout switch, e.g. New task |
| view | `"board" \| "list"` |  | Controlled layout |
| defaultView | `"board" \| "list"` | `"board"` | Starting layout when uncontrolled |
| onViewChange | `(view: AgentInboxView) => void` |  | Called when Board or List is picked |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the layout switch, the cards and the buttons inside an open card
- Enter / Space: Opens or closes a card, presses Approve, Reject, Retry or Open
- Esc: Closes the open card and puts focus back on it

### Accessibility

- Each column is a labeled section; each card is a button with aria-expanded, and a closed card's details are inert
- Board / List is a radio group
- A polite live region says how many tasks need you and how many run

### Motion

- Running tasks spin a small ring and their clock ticks every second
- When a status changes, the card shows its new state in place first, then glides over to its new column (FLIP)
- Cards open in place to the last steps as a tiny timeline and the buttons for what you can do now
- With prefers-reduced-motion everything switches without movement

### Responsive

- Three columns from about 620px; narrower containers always get the list and hide the switch – it works down to 300px
- Touch screens: taller cards and buttons
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass startedAt for running and waiting tasks so the clock ticks; pass elapsed for finished ones
- Columns: Needs you holds waiting and failed tasks, then Running and Done; inside a column the cards keep your order
- Keep the description to one or two sentences on what the task is about or where it stands – it is clamped to two lines
- With a handler the board never changes a status by itself – update the task in your state and the card follows

### Requirements

- React 19

Related: approval-card, agent-plan, tool-call-card, decision-inbox

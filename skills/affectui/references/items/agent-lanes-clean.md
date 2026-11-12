# Agent Lanes, clean style (Pro)

Where every agent is right now – a live timeline with a lane per agent, tasks growing into “now”, hand-offs drawn between agents and approvals right on the block

- Page: https://www.affectui.com/components/agent-lanes
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-lanes-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-lanes-clean`

### When to use

- A team of agents works in parallel and people want to see at a glance who is doing what, and since when
- Multi-agent pipelines where work moves from one agent to the next (research → writing → review)
- A control room for agents: spot the one that waits for a decision, or failed, without opening each run

### When not to use

- A list of background tasks grouped by state – use Agent Inbox
- The steps of one single run – use Agent Plan or Agent Steering
- Scheduling future work on a calendar – the lanes show the last half hour, not the week ahead

### Usage

```tsx
import { AgentLanes, type LaneAgent, type LaneTask } from "@/components/ui/agent-lanes-clean";

const agents: LaneAgent[] = [
  { id: "research", name: "Researcher", model: "Opus 5.5" },
  { id: "writer", name: "Writer", model: "Sonnet 5.5" },
];

export function AgentRoom({ tasks }: { tasks: LaneTask[] }) {
  return (
    <AgentLanes
      agents={agents}
      tasks={tasks} // { id, agentId, title, status, start, end?, handoffTo?, ask? }
      onApprove={(task) => api.approve(task.id)}
      onReject={(task) => api.reject(task.id)}
      onOpen={(task) => router.push(`/runs/${task.id}`)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `LaneAgent[]` |  | One lane each: { id, name, model?, avatar? }. A logo as avatar sits on a white tile; without one the initials show. Free agents get an Idle tag, waiting ones Needs you |
| tasks | `LaneTask[]` |  | { id, agentId, title, status: "done" | "running" | "waiting" | "failed", start, end?, handoffTo?, ask?, summary?, tools? }. No end: the block reaches "now" |
| span | `number` | `30 minutes` | How much time the lanes show, in ms |
| now | `number` |  | A clock you control, e.g. a faster one for a demo. Without it the lanes follow real time, every second |
| onApprove / onReject | `(task: LaneTask) => void` |  | Approve or Reject on a waiting task. Without handlers the lanes change the status themselves |
| onOpen | `(task: LaneTask) => void` |  | Shows an Open link in the tooltip of a block that doesn't wait |
| title | `string` | `"Agents"` | Heading in the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves from block to block, lane by lane
- Enter: Opens a block's tooltip (what got done), or the decision on a waiting one
- Esc: Closes the decision and returns to its block

### Accessibility

- Every lane is a list labelled with the agent's name; every block is a button that names the agent, task, state and time
- A waiting block controls its decision popover (aria-expanded), which is a labelled dialog with Approve focused
- How many tasks need someone is announced politely when it changes

### Motion

- The window slides with the clock: blocks and hand-off curves are drawn from the same time, so they move together; at the left edge blocks slide out and fade
- Running blocks shimmer, a live hand-off curve flows towards the next agent, waiting flags pulse
- With prefers-reduced-motion everything stays still and only updates

### Responsive

- Fills its container up to 760px
- Below 520px the names column shrinks to the avatars
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The component draws what it gets – update tasks from your agent events (status, end) and the lanes follow
- Give a waiting task an ask (one sentence on what needs deciding); it shows above Approve / Reject
- Give any task a summary – two or three short points on what got done – for the dark tooltip a click opens
- tools takes up to three small logos (React nodes) of the apps a task works in; they sit on white tiles before the title
- Use handoffTo on the task that hands over, pointing at the id of the next agent's task

### Requirements

- React 19

Related: agent-inbox, agent-plan, agent-steering, approval-card

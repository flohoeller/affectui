# Live Session, clean style (Pro)

Work with a team of agents while they work – their conversation in the middle, the team's plan ticking off beside it, and the shared context under it; picking an agent points at its steps

- Page: https://www.affectui.com/blocks/live-session
- Section: Blocks · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/live-session-clean.json` (needs the Pro access key)
- Import: `@/components/ui/live-session-clean`

### When to use

- The working view of a multi-agent product: you talk to the team, watch the plan move and see how full the context gets – on one screen
- Human-in-the-loop work where agents ask you things mid-run and you answer in the same place
- Showing who is on which step: pick an agent and its part of the plan stands out

### When not to use

- A finished run to look back on – Run Inspector shows one run in depth
- One agent and one user – Agent Chat or Chat Composer alone is simpler

### Usage

```tsx
import { LiveSession, type SessionStep } from "@/components/ui/live-session-clean";

const steps: SessionStep[] = [
  { id: "prices", title: "Compare per-seat prices", agent: "research", status: "done", duration: 84_000 },
  { id: "copy", title: "Draft the copy for the three plans", agent: "writer", status: "active", startedAt: Date.now() - 60_000 },
  { id: "price", title: "Pick the Team price", agent: "you" },
];

export function Session() {
  return (
    <LiveSession
      agents={[{ id: "research", name: "Researcher" }, { id: "writer", name: "Writer" }]}
      messages={messages}
      task="Launch the new pricing page"
      steps={steps}
      context={{ limit: 200_000, model: "Opus 5.5", parts: [{ id: "talk", label: "Conversation", tokens: 42_000 }] }}
      live
      onSend={({ text, to }) => send(text, to)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `StreamAgent[]` |  | The agents in the session – { id, name, model?, avatar? }; "you" is there on its own |
| messages | `StreamMessage[]` |  | The conversation, as in Collaboration Stream – { id, from, to, kind, text, at?, replyTo?, typing?, attachments?, details? } |
| task | `string` |  | What the team works on – the label of the whole session |
| steps | `SessionStep[]` |  | The team's plan – Agent Steering steps plus agent, the id of whoever works on it ("you" for a step that's yours) |
| status | `"running" \| "paused" \| "done"` | `"running"` | How the plan stands |
| startedAt | `number \| Date` |  | When the session started – the plan counts its running time from here |
| context | `{ parts, limit, model?, modelIcon? }` |  | The shared context as Context Window parts – leave it out to show the plan alone |
| live | `boolean` |  | Agents are still at work – the stream follows new messages and says so |
| logos | `Record<string, ReactNode>` |  | Names that get their logo when a message mentions them, e.g. { Stripe: <StripeLogo /> } |
| focusAgent | `string \| null` |  | Controlled agent the session is narrowed to – the stream fades the rest, the plan keeps that agent's steps |
| onFocusAgentChange | `(id: string \| null) => void` |  | Called when an agent is picked or let go |
| onSend | `(message: { text, to, replyTo? }) => void` |  | A message from you – to everyone, to the agents you named with @, or as a reply |
| onPause / onResume | `() => void` |  | The plan's pause button |
| maxHeight | `number` | `560` | The stream's height when the plan goes under it on narrow screens; side by side it matches the plan and the context |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the agent tabs, the messages, the composer and the context – each shows an accent focus ring; clicking into the composer shows none
- ← / →: In the agent tabs, moves between agents – Home and End jump to the ends
- ↑ / ↓: Moves between messages; Enter opens a message's details
- Esc: Lets go of the picked message or agent – the plan shows every step again
- @: In the composer, opens the agents to name – ↑ ↓ and Enter pick one
- Enter: Sends; Shift + Enter makes a new line

### Accessibility

- The session is a labelled region named after its task
- The plan is an ordered list – the running step is marked as the current one and its time is announced
- Messages carry who wrote them, to whom and when in their label

### Motion

- Picking an agent fades the other messages and the other steps – one pick, both sides
- Steps tick off as they finish; the context's cells fill as the conversation grows
- With prefers-reduced-motion everything changes in one step

### Responsive

- Side by side, the stream is exactly as tall as the plan and the context – its messages scroll, the composer stays at the bottom
- Follows its own width: below 860px the plan and the context go under the stream, which takes maxHeight
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: collaboration-stream, agent-steering, context-window, mission-control

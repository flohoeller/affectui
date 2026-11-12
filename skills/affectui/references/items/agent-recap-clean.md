# Agent Recap, clean style (Pro)

What the agents did while you were away – the night as a small chart with a peak per event, then a board of what needs you, what failed and what's done, acted on right on the card

- Page: https://www.affectui.com/components/agent-recap
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-recap-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-recap-clean`

### When to use

- The first thing people see when they come back to agents that kept working – in the morning, after a meeting, after a weekend
- A catch-up where the few things that need a decision come first and can be decided right there
- Showing that the agents were busy without making people read every step

### When not to use

- A live feed of what agents are doing right now – use Agent Monitor or Agent Lanes
- A full log with undo for every change – use Agent Ledger
- Decisions without the rest of the night – use Decision Inbox

### Usage

```tsx
import { AgentRecap, type RecapEvent } from "@/components/ui/agent-recap-clean";

const events: RecapEvent[] = [
  { id: "refund", kind: "needs", at: "2026-10-30T02:14", title: "Refund $240 to Acme Corp",
    detail: "Over the $200 auto-approve limit", action: "Approve", doneLabel: "Approved" },
  { id: "sync", kind: "failed", at: "2026-10-30T03:02", title: "Contact sync to the CRM",
    detail: "Token expired after 1,284 of 3,900 contacts" },
  { id: "tickets", kind: "done", at: "2026-10-29T19:05", title: "Answered support tickets", count: 38 },
];

export function Morning() {
  return <AgentRecap events={events} since={lastSeenAt} onAction={(e, a) => handle(e, a)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| events | `RecapEvent[]` |  | { id, at, kind, title, detail?, logo?, count?, action?, doneLabel? } – everything that happened, any order |
| kind | `"needs" \| "failed" \| "done"` |  | Per event – needs you (with its action), failed (with Retry) or done |
| since / until | `Date \| string \| number` |  | When the person left, and now – the chart runs between them; until defaults to the time it renders |
| onAction | `(event, action: "primary" \| "review") => void \| Promise` |  | The main action (Approve, Retry …) or Review. Return a promise and the row shows it working until it settles – a rejected one puts the row back |
| onUndo / onRedo | `(event) => void` |  | Undo on a card that was acted on or on something an agent did (a done card), and Redo after that |
| limit | `number` | `3` | Cards per lane at most – every lane keeps room for this many, so the three stay the same height however full they are |
| replay | `number` | `1800` | How long the night replays when it opens, in ms – 0 shows everything at once |
| title | `string` | `"While you were away"` | Heading |
| locale | `string` |  | For the times and counts |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the actions card by card – Review, then the main action (or Undo / Redo)
- Enter / Space: Runs the focused action; focus then moves to Undo, and back to the action after Undo

### Accessibility

- A section named by its heading; each lane has a heading with its count – of everything in it, also beyond the limit
- Every button says what it does to which task – "Approve: Refund $240 to Acme Corp" – so a screen reader never hears three bare Approves
- When an action finishes, a polite live region says so – "Approved: Refund $240 to Acme Corp" – and focus moves to Undo, so it never drops to the page
- Focusing anything in a card lights up its dot on the chart, the same as pointing at it; the chart itself is decorative and hidden from screen readers – everything on it is in the cards
- Every time is a <time> with the full date; empty lanes say so in words

### Motion

- The night is a small line chart with a peak per event and an area fading out below; when it opens, the line draws itself from left to right, each dot pops onto its peak as it's passed, its card fades in and the counts count along
- Pointing at the chart draws a line through its whole height; close to an event it snaps there, the dot grows, its card lights up and a tip says what it was – pointing at a card lights up its dot
- With prefers-reduced-motion everything shows at once

### Responsive

- Every card is the same height and ends in the same line – a state tag (Done, Fixed, Approved) and the buttons – so acting on one never moves anything
- Under 640px the three lanes stack
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every event a unique id – Undo, focus and the chart keep track of cards by it
- Events without a readable time are left out; ones before since or after until sit at the chart's edges
- A lane shows up to limit cards – keep the rest for a full view and link to it from your page
- since is when the person was last active – store it when they leave or go idle
- Merge many small done events into one card with a count (38 tickets) instead of 38 cards – the count also makes its peak taller
- Give needs cards a doneLabel in the past tense of their action – Approve → Approved, Send → Sent
- Colors are variables on .ui-rcp, e.g. --ui-rcp-needs or --ui-rcp-failed

### Requirements

- React 19

Related: decision-inbox, agent-inbox, agent-ledger, notification-stack

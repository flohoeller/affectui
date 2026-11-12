# Scheduled Runs, clean style (Pro)

Agent tasks sorted into a week of sessions – each session has a usage limit, small tasks fill the gaps, big ones are split across sessions, and the stack flies in one card at a time

- Page: https://www.affectui.com/components/scheduled-runs
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/scheduled-runs-clean.json` (needs the Pro access key)
- Import: `@/components/ui/scheduled-runs-clean`

### When to use

- Agents that run against a usage limit per session – coding agents, API quotas, rate-limited tools – and a week of work to fit in
- Showing people where their queued tasks will run before they run, and which ones need more than one session
- A backlog that gets sorted into a calendar automatically, next to runs that were booked by hand

### When not to use

- Tasks handed from agent to agent – use Agent Handoff
- A queue that runs as soon as a worker is free, with no sessions – use Agent Queue
- What a single run costs in time and money – use Trace Waterfall

### Usage

```tsx
import { ScheduledRuns, type ScheduledTask } from "@/components/ui/scheduled-runs-clean";

const tasks: ScheduledTask[] = [
  { id: "metrics", title: "Weekly metrics report", usage: 40, at: { day: 1, session: 0 } },
  { id: "oauth", title: "Migrate auth to OAuth 2.1", agent: "Claude Code", usage: 140 },
  { id: "flaky", title: "Fix flaky checkout test", agent: "Claude Code", usage: 35 },
];

export function Week() {
  return <ScheduledRuns tasks={tasks} now={{ day: 1, session: 0 }} note="5-hour sessions" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | `ScheduledTask[]` |  | { id, title, usage, agent?, detail?, logo?, at? } – booked tasks have at: { day, session }; the rest wait in the stack and are sorted in, in this order |
| usage | `number` |  | Per task – what it takes out of one session's limit, in percent; over the limit it's split across sessions |
| days | `(string \| { name, date? })[]` | `Mon–Wed` | Column heads – three days read best; more fit, the week then scrolls sideways on narrow screens |
| sessions | `string[]` | `["07:00", "12:00", "17:00"]` | Row heads – when each session starts |
| now | `{ day, session }` | `{ day: 0, session: 0 }` | The session running now – earlier ones are dimmed and take no new tasks; a red line marks where it starts |
| limit | `number` | `100` | What one session can take, in the unit of usage |
| minPiece | `number` | `15` | A split task never leaves a piece smaller than this in a session |
| agents | `{ name, logo? }[]` | `every task's agent` | The agents in the head as small overlapping logos – picking one fans them out, slides its name out and fades the other agents' tasks back |
| defaultMode | `"auto" \| "manual"` | `"auto"` | Auto sorts the stack in when switched to; Manual puts the sorted-in cards back on the stack – booked cards and cards placed by hand stay. Both switch mid-run |
| autoRun | `boolean \| number` | `false` | In Auto: sorts the stack in on its own – after 800ms, or after the number of ms |
| loop | `boolean` | `false` | Clears the week and sorts in again, over and over – for demos |
| title / note | `string` | `"This week"` | Heading, and a quiet note next to it – e.g. "5-hour sessions" |
| onScheduled | `(parts: ScheduledPart[]) => void` |  | Every piece in the week once the stack is sorted in – { task, day, session, usage, part, parts } |
| onPlace | `(task: ScheduledTask, parts: ScheduledPart[]) => void` |  | A task was dragged from the stack into a session – with the pieces it was split into |
| onMove | `(part: ScheduledPart, to: { day, session }) => void` |  | A card was dragged to another session – save it |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the cards – the stack first, then the sessions day by day
- Enter: Opens or closes the focused card's details
- Space: Picks the focused card up to move it – and drops it where it is aimed
- ArrowLeft / ArrowRight: While holding a card: the session a day earlier or later
- ArrowUp / ArrowDown: While holding a card: the session before or after on the same day
- Escape: Puts a held card back (with the mouse too); closes the details
- ArrowLeft / ArrowRight: On Auto / Manual: switches between them

### Accessibility

- Every card is a focusable button with a visible focus ring; its hint says what Enter and Space do – past cards say they can't move
- Moving by keyboard is announced in a polite live region: what was picked up, each session it's aimed at and whether it has room – or why not – and where it landed
- After a drop, focus moves to the card in its new session; Escape returns it to the card it came from
- The week is a grid with day and session heads; Auto / Manual is a radio group you switch with the arrows
- The button-like agent logos are toggle buttons named after their agent

### Motion

- Each card flies from the stack into its first session and shrinks into a chip on the way; the stack closes up behind it
- The other pieces of a split task drop into their sessions, the bars at the foot of the sessions fill
- A red line with a dot on its left sits between the sessions that are over and the one running
- A click on a card opens its details right under it – what it does, the agent, the session and its share; a click elsewhere closes them
- Dragging a card – from the stack or between sessions – lifts a copy under the pointer; sessions without room for it – full, out of places or already past – turn gray and striped, the one under it lights up
- With prefers-reduced-motion the cards appear in place without flying

### Responsive

- Every session keeps its height and takes two cards – sessions with two are full for dragging and for Auto
- A long stack scrolls inside its column – it never stretches the board
- Under 640px the stack moves on top and the week scrolls sideways
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every task a unique id – placing, moving and focus keep track of tasks by it
- A task without a usage (NaN) can't be scheduled and says so; a usage of 0 or less counts as 1%
- Booked tasks outside the days and sessions shown are left out
- usage is a share of one session's limit – e.g. estimated tokens divided by the session's token limit, times 100
- Auto never splits a task that fits one session – it waits for a session with room for all of it
- Dragged by hand, a task goes where it's dropped: whatever doesn't fit there runs on into the next sessions with room, after the last one into the earliest free one from now on; pieces are numbered by time and merge within a session
- Tasks that don't fit anywhere this week stay in the stack, marked "No room this week"
- Drag a task from the stack into a session to book it by hand – a big one is split from there on; Auto then sorts in only what's left
- A press that moves less than 4px is a click (details), anything more is a drag
- Holding a card in the stack pauses Auto until it's let go – a click lets Auto carry on
- Cards can be grabbed at any time – dragging one while Auto sorts in lets the card in the air land, then stops and switches to Manual; Auto picks up the rest again
- With loop, the demo waits while the pointer is over it and stops for good once someone clicks or drags
- Cards can be dragged to any session from now on with a free place (two cards at most) and at least minPiece of its limit left; past sessions can't be dragged from or to
- planWeek is exported – use it on the server to book the same plan the component shows
- Colors are variables on .ui-srn, e.g. --ui-srn-meter or --ui-srn-track

### Requirements

- React 19

Related: agent-handoff, agent-queue, usage-meter, trace-waterfall

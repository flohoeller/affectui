# Handoff Relay (Pro)

One task passed from agent to agent like a baton, played back live – every agent a tile with its pixel mark that fills in as the baton travels, and a log of the run

- Page: https://www.affectui.com/components/handoff-relay
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/handoff-relay.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/handoff-relay-clean.json` (needs the Pro access key) – lands as `handoff-relay-clean.tsx`, import from `@/components/ui/handoff-relay-clean` – its docs: `handoff-relay-clean.md`
- Import: `@/components/ui/handoff-relay`

### When to use

- One task travels through a chain of agents – triage, research, writing, review – and people should see who has it right now
- Replaying a finished multi-agent run step by step, with pause and replay, in a run view or a demo
- A live view of a running pipeline, driven by your own clock

### When not to use

- What went along at each handoff and what got lost – use Agent Handoff
- Who does what across lanes, with approvals and tools – use Handoff Swimlanes
- Agents working side by side at the same time – use Agent Lanes

### Usage

```tsx
import { HandoffRelay, type RelayAgent, type RelayEvent } from "@/components/ui/handoff-relay";

const agents: RelayAgent[] = [
  { id: "triage", name: "Triage", role: "Router", doing: "classifying the request" },
  { id: "researcher", name: "Researcher", role: "Analyst", doing: "pulling 6 sources" },
  { id: "writer", name: "Writer", role: "Author", doing: "drafting the summary" },
];

const events: RelayEvent[] = [
  { at: 0, agent: "triage", text: "Run started" },
  { at: 1800, agent: "triage", to: "researcher", text: "classified as research" },
  { at: 4600, agent: "researcher", text: "6 sources shortlisted" },
  { at: 5100, agent: "researcher", to: "writer", text: "6 sources attached" },
  { at: 8000, agent: "writer", text: "Approved", note: "draft signed off", end: "approved" },
];

<HandoffRelay agents={agents} events={events} task="Summarize churn drivers from Q2 tickets" />
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `RelayAgent[]` |  | { id, name, role?, model?, doing?, color? } – in the order the baton travels |
| events | `RelayEvent[]` |  | { at, agent, text, to?, end?, note?, logo?, cost? } – everything that happened, in ms from the start |
| logo (event) | `ReactNode` |  | Per step – the logo of the tool it used, on a small white tile; without it the line shows its agent's mark |
| cost | `number` |  | Per event – what that step cost; added up into the run's cost on the top right, next to its time |
| formatCost | `(amount: number) => string` | `dollars` | Formats the run's cost |
| logoFill | `boolean` |  | Per step – the logo is a square of its own (e.g. Intercom's blue tile) and fills the tile edge to edge |
| to | `string` |  | Per event – makes it a handoff from agent to this agent: the line fills on to that agent and its mark starts to twinkle |
| end | `"approved" \| "failed"` |  | Per event – the run ends here; its text shows green or red in the log and the footer |
| doing | `string` |  | Per agent – what the footer says while it holds the baton (defaults to its latest step) |
| color | `string` |  | Per agent – any CSS color; defaults to blue, purple, orange, green … in order (one agent alone is blue) |
| task | `string` |  | What the run is about – muted, under the title |
| time | `number` |  | Drives it from your own run (ms) – no own clock, no controls |
| autoPlay | `boolean` | `true` | Starts playing on mount |
| speed | `number` | `1` | Playback speed |
| onHandoff | `(from, to) => void` |  | A handoff happened while it played |
| onFinish | `() => void` |  | The run reached its end while it played |
| title | `string` | `"Handoff Relay"` | Heading on the frame |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves to the agents (one stop), the log, Restart and Pause / Resume / Replay
- ArrowLeft / ArrowRight: Walks the agents; Home and End jump to the first and the last
- Enter / Space: On an agent: opens its card, with the focus on Close; Jump to goes to the moment it got the baton
- Esc: Closes the card and goes back to its agent

### Accessibility

- An agent's card is a dialog in the top layer, so no edge cuts it; the agent says whether its card is open (aria-expanded)
- Each agent is a button that says its name, role and state; the agents are one tab stop
- The log is a list that can be scrolled with the keyboard; the arrow between two names is read as "to"
- Who has the task, and the result at the end, are announced politely

### Motion

- An agent's card opens with a short fade and lift under its agent – above it when there's no room below
- At a handoff the line to the next agent fills in light blue and a spark runs along it – a line on the line, full at its head and fading to nothing at its tail, as in Agent Loop
- Later, sparks run along the lines the baton has passed now and then, each a little out of step with the next; they rest while paused
- The agent holding the baton gets a small bounce, its pixel mark twinkles in a diagonal wave and a light shimmer runs over its name; agents still waiting step back
- New log lines rise in from below and the log glides along; the result lands as a small green or red badge
- With prefers-reduced-motion everything changes at once

### Responsive

- Built on a container query; under 420px the task next to the title steps aside
- Many agents scroll sideways inside the lane – each agent keeps at least 72px
- Fixed heights: the log keeps five lines and the footer one, so nothing jumps while it plays
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- at is ms from the start of the run, not a timestamp; events are sorted for you
- The first agent holds the baton at the start; only events with to move it on
- The last event's time is the length of the replay – give the final one end: "approved" or "failed"
- Agents are drawn with affectUI's pixel mark, a pattern from their id – keep ids stable
- Colors are variables on .ui-hr – --ui-hr-c0 … --ui-hr-c7 for the marks, --ui-hr-link / --ui-hr-head for the line
- The control icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: agent-handoff, handoff-swimlanes, agent-lanes, run-controls

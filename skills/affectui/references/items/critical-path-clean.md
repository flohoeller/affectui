# Critical Path, clean style (Pro)

An agent run's spans on a timeline, one lane per agent – the critical path that decides when the run ends in full tint, and drag a span to see a what-if

- Page: https://www.affectui.com/components/critical-path
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/critical-path-clean.json` (needs the Pro access key)
- Import: `@/components/ui/critical-path-clean`

### When to use

- Showing what decided when an agent run ended – the chain of spans the run waited on, across agents
- Asking what-if: would the run end sooner if this step were faster, or if it ran on another agent?
- Finding where to optimize – spans with slack can get slower for free, spans on the critical path can't

### When not to use

- Every span nested under its parent with tokens and cost – use Trace Waterfall or Agent Flame Graph
- Who hands work to whom while a run is live – use Handoff Swimlanes
- How the run went against the plan – use Plan vs Actual

### Usage

```tsx
import { CriticalPath, type CriticalLane, type CriticalSpan } from "@/components/ui/critical-path-clean";

const lanes: CriticalLane[] = [
  { id: "planner", name: "Planner", model: "Opus 5.5", logo: <ClaudeLogo /> },
  { id: "coder", name: "Coder", model: "Sonnet 5", logo: <ClaudeLogo /> },
  { id: "tests", name: "Test Runner", model: "GPT-5 mini", logo: <OpenAILogo /> },
];

const spans: CriticalSpan[] = [
  { id: "plan", name: "plan", lane: "planner", kind: "llm", start: 0, duration: 9200 },
  { id: "fix", name: "write fix", lane: "coder", kind: "llm", start: 12000, duration: 34500, deps: ["plan"] },
  { id: "tests", name: "run tests", lane: "tests", kind: "tool", logo: <TerminalIcon />, start: 47000, duration: 24800, deps: ["fix"] },
];

export function Run() {
  return <CriticalPath title="Ship v2.4" lanes={lanes} spans={spans} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| lanes | `CriticalLane[]` |  | One per agent, top to bottom – { id, name, model?, logo?, color?, person? } |
| spans | `CriticalSpan[]` |  | { id, name, lane, kind, duration, start?, deps?, logo?, detail?, failed? } – durations and starts in ms from the start of the run |
| kind | `"llm" \| "tool" \| "agent"` |  | The bar's tint – indigo, teal or gray; failed: true tints it red |
| deps | `string[]` |  | The spans it waits for – it starts when the last of them ends. A lane runs its spans one after another on top of that |
| start | `number` |  | When it really started – a wait after it could have started is kept in every what-if; leave it out to start as soon as possible |
| title | `string` |  | The run's name in the head – "Agent run" by default |
| step | `number` |  | How much ⇧← / ⇧→ change a span, in ms – 500 by default |
| hint | `ReactNode \| false` |  | A quiet line under the timeline until the first edit – false hides it |
| onChange | `(whatIf) => void` |  | After every edit and on reset – { durations, lanes, end, baseEnd, critical } |
| formatDuration | `(ms) => string` |  | Formats every duration – "3.4 s", "1m 42s" by default |
| className | `string` |  | An extra class on the root |

### Accessibility

- The spans are one tab stop: ← and → move along a lane, ↑ and ↓ to the nearest span on the next lane, Home and End to the first and last on a lane
- Enter or Space opens and closes the focused span's card; Esc closes it and focus stays on the span
- ⇧← and ⇧→ shorten and lengthen the focused span in steps – the keyboard's way to drag its end; ⌥↑ and ⌥↓ move it to the lane above or below
- R on a span resets the what-if; the Reset button does too and hands focus to the timeline when it turns off
- Every span reads as its name, agent, duration, what it was before and its slack – "translate, Translator, 20 s, was 22 s, 0.4 s slack"
- What an edit did is announced once it lands – "Run ends 1.6 s earlier. Critical path: plan, search_code, …"
- A focus ring shows only for the keyboard – clicks and drags never leave one, and a drag never selects

### Motion

- The bars grow in from the left, one after another
- After an edit every span that waits for it slides along, a beat after the one before; while dragging they follow closely, the farther ones a little later
- When another chain becomes the critical path, the highlight hops along it span by span
- The arrows and the end line move with the bars every frame
- Reduced motion turns all of it off – spans jump to where they belong

### Responsive

- Fills its container's width – the time scale fits it, so it never scrolls sideways
- Below 520px the lanes keep only their pixel marks and the hint steps aside
- On touch screens the end of a bar has a wider handle; a finger on a bar scrolls the page and a tap opens its card
- Names that don't fit end in … – a bar that is too small shows only its logo, then nothing; the card has them in full
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- One lane per agent, one span per LLM call, tool call or agent step – with its real duration and start
- Put only real waits into deps: what a span needed before it could start. A lane's own order is implied
- Cycles and unknown ids are ignored rather than thrown – check deps if a line is missing
- Use onChange to suggest a concrete fix: the spans on the critical path are the only ones worth making faster

### Requirements

- React 19

Related: trace-waterfall, agent-flame-graph, tool-calls-network, handoff-swimlanes, plan-vs-actual

# Agent State Machine, clean style (Pro)

One agent as a state diagram – every state a card, every transition a line with a count of how often the run took it, retries as loops and the current state glowing

- Page: https://www.affectui.com/components/agent-state-machine
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-state-machine-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-state-machine-clean`

### When to use

- Showing what an agent is doing right now – and every state it can be in – as a diagram people know from UML
- Seeing how a run went: which paths it took, how often it looped back, where it spent its time
- Runs that pause for a person, where someone approves right where the agent waits

### When not to use

- Every message and tool call in order – use Agent Sequence
- Several agents handing work to each other – use Handoff Swimlanes
- How long each step took on a time axis – use Trace Waterfall

### Usage

```tsx
import { AgentStateMachine, type MachineState, type MachineTransition } from "@/components/ui/agent-state-machine-clean";

const states: MachineState[] = [
  { id: "plan", label: "Planning", color: "#8b5cf6", tools: [{ name: "Linear", logo: <LinearLogo /> }], visits: 3, time: 6000 },
  { id: "tool", label: "Calling tool", color: "#0ea5e9", tools: [{ name: "GitHub", logo: <GitHubLogo /> }], visits: 2, time: 9000 },
  { id: "ask", label: "Waiting for you", kind: "waiting", col: 1, row: 1 },
  { id: "done", label: "Done", kind: "final" },
];

const transitions: MachineTransition[] = [
  { from: "plan", to: "tool", label: "needs data", count: 2 },
  { from: "tool", to: "tool", label: "timeout, retry", count: 1 },
  { from: "tool", to: "plan", label: "not enough", count: 1 },
  { from: "plan", to: "ask", label: "needs approval" },
  { from: "ask", to: "tool", label: "approved" },
  { from: "tool", to: "done", label: "answered" },
];

export function Run() {
  return (
    <AgentStateMachine
      agent={{ id: "atlas", name: "Atlas", model: "Claude Opus 5.5", logo: <ClaudeLogo /> }}
      states={states}
      transitions={transitions}
      current="tool"
      onApprove={() => api.approve()}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| states | `MachineState[]` |  | Every state – { id, label, kind?, description?, color?, tools?, time?, visits?, col?, row? }; the first one is where the run starts |
| kind | `"normal" \| "waiting" \| "error" \| "final"` |  | Waiting turns amber and can be approved in its card, error turns red, final carries a bullseye and turns green once reached |
| tools | `{ name, logo? }[]` |  | The tools the agent uses in that state – small overlapping tiles with their logos on the card, by name in its card |
| color | `string` |  | The color of the state's icon |
| time / visits | `number` |  | Time spent in the state so far (ms) and how often the run entered it – shown on the card |
| transitions | `MachineTransition[]` |  | { from, to, label, count?, detail?, id? } – forward lines go right, back to an earlier state over the top or underneath, a retry in the same state is a loop |
| current | `string` |  | The state the agent is in now – it glows; when it changes along a transition, a light runs along it |
| agent | `{ id?, name, model?, logo? }` |  | The header – the agent's pixel mark, its name, and the model with its maker's logo |
| onApprove / onReject | `(state) => void` |  | Show Approve and Reject in the card of a waiting state the agent is in – the card closes after either |
| onSelect | `({ state } \| { transition } \| null) => void` |  | A state's or a count's card opened or closed |
| formatTime | `(ms) => string` |  | Formats the time in a state – 12s, 2m 05s by default |
| title / className | `string` |  | The heading instead of the agent's name, and an extra class on the root |

### Accessibility

- Every state and every count is a button with aria-expanded – Enter or Space opens its card
- A state reads as its name, whether it's the current one, how often it was entered and how long the agent spent there
- A count reads as its trigger, from where to where and how often – "needs data: Planning to Calling tool, 2 times"
- Where the agent is now is announced as it changes; the header never repeats the same words
- A card opened with the keyboard takes focus – on a waiting state straight to Approve; Esc closes it from anywhere and focus goes back
- The lines, dots and the light are decoration and hidden from screen readers – each card lists where its state leads
- A focus ring shows only for the keyboard

### Motion

- On first view the states settle in, the lines draw themselves and the counts appear
- When the agent moves on, a short light runs once along that transition – full at its head, fading out behind – and its count rolls up
- The current state shimmers with the agent's mark twinkling; a waiting state breathes softly
- Pointing at a state brings its transitions forward and fades the rest
- Reduced motion turns all of it off – the states simply change

### Responsive

- Fills its container's width – spare room widens the gaps between the columns
- Short of room the gaps narrow first; still too wide, the whole diagram scales down to fit – it never scrolls sideways
- Long state names end in …; the full name is in the card – Arabic and other scripts read in their own direction
- Counts get thousands separators – 1,284× – and from 10,000 on a card they're short – 12K×; times that aren't numbers are left out
- With more than three tools a card shows two tiles and +n; short of room the tiles give way, never the time or the count
- Transitions to or from states that don't exist and repeated ids are left out; states nothing leads to go after the rest
- A long chain in one row scales down a lot – give such states rows so the diagram stays readable
- Lines back to an earlier state go over the top where nothing sits above their ends, otherwise underneath; pin states with col and row where they'd cross a card
- Cards open below what you clicked, above it near the bottom of the screen
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep state labels to two or three words and transition labels to what triggers them – "needs data", "tool result"
- Put the first state first in the list – it's where the start dot points
- Count transitions and visits from the run's events and pass them in; change current as the agent moves
- Use kind waiting for every state where a person has to act, and wire onApprove

### Requirements

- React 19

Related: agent-sequence, handoff-swimlanes, agent-tree, trace-waterfall

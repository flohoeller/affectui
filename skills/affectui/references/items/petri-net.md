# Petri Net (Pro)

Agents working in parallel and waiting on each other, as a Petri net – tokens in places, steps that fire only when every input is ready, a person's step waiting for approval

- Page: https://www.affectui.com/components/petri-net
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/petri-net.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/petri-net-clean.json` (needs the Pro access key) – lands as `petri-net-clean.tsx`, import from `@/components/ui/petri-net-clean` – its docs: `petri-net-clean.md`
- Import: `@/components/ui/petri-net`

### When to use

- Agents working in parallel that have to wait for each other – who can start, what each step needs, where the run is stuck
- Showing why a step hasn't run yet: its card shows which inputs hold a token, and it only fires once all of them do
- Runs with a person in the loop – their step waits in amber until they approve

### When not to use

- Who does which step in order, lane by lane – use Handoff Swimlanes
- One agent's states and transitions – use Agent State Machine
- Steps over time with their duration – use Trace Waterfall or Agent Timing

### Usage

```tsx
import { PetriNet, type PetriPlace, type PetriTransition } from "@/components/ui/petri-net";

const places: PetriPlace[] = [
  { id: "api-todo", label: "API to build", col: 0, row: 0, tokens: 1 },
  { id: "ui-todo", label: "UI to build", col: 0, row: 1, tokens: 1 },
  { id: "api-ready", label: "API ready", col: 2, row: 0 },
  { id: "ui-ready", label: "UI ready", col: 2, row: 1 },
  { id: "tested", label: "Tests pass", col: 4, row: 0.5, kind: "end" },
];

const transitions: PetriTransition[] = [
  { id: "api", label: "Build API", col: 1, row: 0, inputs: ["api-todo"], outputs: ["api-ready"], agent: { id: "backend", name: "Backend agent" } },
  { id: "ui", label: "Build UI", col: 1, row: 1, inputs: ["ui-todo"], outputs: ["ui-ready"], agent: { id: "frontend", name: "Frontend agent" } },
  // A join – it fires only once both the API and the UI are ready
  { id: "integrate", label: "Integrate", col: 3, row: 0.5, inputs: ["api-ready", "ui-ready"], outputs: ["tested"], agent: { id: "qa", name: "QA agent" } },
];

export function Release() {
  return <PetriNet name="Ship v2.4" places={places} transitions={transitions} run={[["api", "ui"], "integrate"]} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` |  | The run's name, in the head |
| places | `PetriPlace[]` |  | { id, label, col, row, tokens?, kind? } – white circles with the button edge that hold tokens as small dark pixels. col and row place it on the grid (halves are fine); tokens are the ones it starts with; kind "end" draws the final place with a check once a token arrives |
| transitions | `PetriTransition[]` |  | { id, label, col, row, inputs, outputs, agent?, person? } – steps, drawn as cards: who does it on a tinted tile, the step, a progress circle with how many inputs hold a token (1/2 inputs) and its state. It fires when every input place holds a token: takes one from each, its agent works, puts one into every output. agent { id, name, color? } draws its pixel mark on a tile in its color; person { name, photo? } makes it a step that waits for approval |
| run | `(string \| string[])[]` |  | Transition ids to fire by themselves, in order – an array fires several together. Each step waits until it can fire; a person's step waits a moment longer, as if deciding. Shows Pause and Reset in the head |
| loop | `boolean` |  | Start the run over when it's done – default true |
| pace | `number` |  | Milliseconds a step takes its tokens and gives them on – default 650; the agent works twice as long |
| onFire | `(transitionId: string) => void` |  | Called whenever a transition fires |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-pn-token |

### Keyboard

- Tab: Pause and Reset, then each step in turn
- Enter / Space: Opens the step's card – what it needs and gives, with Fire or Approve when it can fire; Esc closes it

### Accessibility

- Every step is a button that reads its name, who does it and its state – can fire, waiting for approval, working, fired or waiting for inputs
- Every place has a title with its name and how many tokens it holds
- A polite live region (not shown) says which step is working, who is awaited, and what just fired
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- While a step is active a light runs along its arcs again and again – full at its head, fading behind, the lines themselves stay grey – and a soft light sweeps across its card, its name shimmers and its agent's mark twinkles
- Then the light runs on along its outgoing arcs, and a token pops into every place after it
- A person's step waits with a slower amber light sweeping across its card and their photo pulsing – no colored fills or borders, only the motion and the state in the card's foot
- With prefers-reduced-motion nothing runs – tokens simply move from place to place

### Responsive

- The net sits right on the card – no field behind it – drawn at its own size and zoomed to the card's width (never larger); below 62% it scrolls sideways
- Narrow: the name takes its own row above the counters
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Lay the net out left to right: places and transitions alternate by column, rows keep parallel work apart
- Put a join's transition between its inputs (row 0.5 between rows 0 and 1) so its arcs meet cleanly
- Give agents palette colors (var(--aui-teal), var(--aui-pink) …) – their tile takes a light tint of it, so parallel lanes read apart

### Requirements

- React 19

Related: handoff-swimlanes, agent-state-machine, decision-table, fan-out-grid

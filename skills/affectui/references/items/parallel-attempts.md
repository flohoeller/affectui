# Parallel Attempts (Pro)

An agent tries the same task several ways at once and the best one wins – every attempt races as a row with its model, approach and live bar, then gets a score; the best is marked and picked, and you can switch to another

- Page: https://www.affectui.com/components/parallel-attempts
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/parallel-attempts.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/parallel-attempts-clean.json` (needs the Pro access key) – lands as `parallel-attempts-clean.tsx`, import from `@/components/ui/parallel-attempts-clean` – its docs: `parallel-attempts-clean.md`
- Import: `@/components/ui/parallel-attempts`

### When to use

- An agent tries a task several ways at once – different models, prompts or approaches – and the best result wins
- Best-of-N runs, where you want to see them race, compare their scores and keep the say in which one is used
- Code fixes, drafts or plans that are cheap to try in parallel and easy to score

### When not to use

- One run and where its time goes – use Trace Waterfall
- Many small tasks spread over workers – use Fan-out Grid
- A single decision the agent can't take alone – use Decision Tree

### Usage

```tsx
import { ParallelAttempts, type Attempt } from "@/components/ui/parallel-attempts";

const attempts: Attempt[] = [
  { id: "a", name: "Opus 5.5", approach: "Add a retry with backoff",
    status: "running", progress: 0.6, step: "Running tests 12/20" },
  { id: "b", name: "GPT-6 Sol", approach: "Mock the payment API",
    status: "done", score: 94, note: "20/20 runs green", took: 125000, cost: 0.27 },
];

export function Fix() {
  return <ParallelAttempts attempts={attempts} task="Fix the flaky checkout test" onPick={(a) => apply(a.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| attempts | `Attempt[]` |  | { id, name, approach, model?, icon?, status, progress?, step?, score?, note?, took?, cost? } – one per attempt, in the order the rows should show; name is usually the model, icon its logo (on a small tile before the name) |
| status | `"running" \| "done" \| "failed"` |  | Per attempt – picks the bar's tint: blue with a shine, green, red |
| progress | `number` |  | Per attempt, 0 to 1 – the bar's length while it runs (and where a failed one stopped) |
| step | `string` |  | Per attempt – what it does right now, shown on the right while it runs |
| score | `number` |  | Per attempt, 0–100 once done – the highest is marked Best and picked unless you pick another |
| note | `string` |  | Per attempt – one line about the outcome, or the error |
| task | `string` |  | What all of them try to do, next to the title |
| picked | `string \| null` |  | Controlled pick – leave it out and the best finished attempt is picked on its own |
| onPick | `(attempt) => void` |  | Another attempt was picked with "Use this one" |
| formatCost | `(amount: number) => string` | `dollars` | Formats every cost |
| title | `string` | `"Best of N"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves to the finished attempts' "Use this one" buttons
- Enter / Space: Uses the focused attempt

### Accessibility

- The rows are a radiogroup labelled with the title; each finished attempt's button is a radio with its name and score
- Bars are decoration – what they show is in the text beside them

### Motion

- Rows come in a beat after each other
- Running bars grow with a shine sweeping over them and a soft glow at their leading edge
- When an attempt finishes its bar turns green or red; the line under its name turns into the outcome in place – cards never change height
- The best one gets a Best tag; the one in use a soft green wash, while the others step back – pointing at one brings it forward again
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query: wide, name, bar and score sit in one line
- Under 560px the bar moves under the name, the approach drops out and the score sits beside the name
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass every attempt every time something changes – ids keep rows in place
- progress is 0–1; a failed attempt keeps the progress where it stopped
- Scores are yours to define (tests passed, an eval, a judge) – only their order matters for Best
- Colors are variables on .ui-pa, e.g. --ui-pa-best-bg / --ui-pa-best-edge
- The tick icon is Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: fan-out-grid, agent-lanes, trace-waterfall, decision-tree

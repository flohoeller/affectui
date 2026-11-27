# Token Budget, clean style (Pro)

How many tokens an agent's runs take against a limit – the average per run large, every run as a bar in its model's color, the part above the limit in pink

- Page: https://www.affectui.com/components/token-budget
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/token-budget-clean.json` (needs the Pro access key)
- Import: `@/components/ui/token-budget-clean`

### When to use

- How many tokens an agent's runs take against a per-run limit – and which model burned them
- A dashboard tile next to other agent chart cards, live as new runs come in

### When not to use

- Where the tokens of one run went – use Token Flow
- How much of a model's context one run fills – use Context Window
- Money over a billing period – use Usage Meter or Cost Waterfall

### Usage

```tsx
import { TokenBudget, type BudgetRun, type BudgetModel } from "@/components/ui/token-budget-clean";

const models: BudgetModel[] = [
  { id: "opus", name: "Opus 5.5" },
  { id: "gpt", name: "GPT-5" },
];

const runs: BudgetRun[] = recent.map((r) => ({ id: r.id, label: `Run #${r.number}`, model: r.model, tokens: r.totalTokens }));

<TokenBudget title="Research agent tokens" runs={runs} limit={250_000} models={models} onAction={() => openUsage()} />
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| runs | `BudgetRun[]` |  | { id, tokens, model?, label? } – oldest first, the last one is the latest; ids keep the bars in place as new runs come in |
| limit | `number` |  | Tokens per run to stay under – a pink line with its number on the left; the part of a bar above it turns pink |
| models | `BudgetModel[]` |  | { id, name, color? } – the bars' colors and the legend; colors default to green, cyan, purple, amber, blue |
| title | `string` | `"Token Budget"` | Heading on the frame |
| icon | `ReactNode` |  | A small mark before the title – defaults to a coin, in green |
| actionLabel / onAction | `string / () => void` | `"Open"` | The button on the top right – it shows when onAction is given |
| formatTokens | `(n: number) => string` | `"184k" / "1.2M"` | Formats every count |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves into the runs (one stop) and on to Open
- ArrowLeft / ArrowRight: Walks the runs and shows each one's model, tokens and how far it went over; Home and End jump to the oldest and the latest
- Esc: Lets go of the run

### Accessibility

- The runs are a single tab stop; the run you're on is its description
- How many runs went over is said in words, not only in pink

### Motion

- Bars grow up from the base; a new run comes in on the right and the others glide to their new place
- When the scale changes, the bars, the limit line and its number glide to their new heights
- Picking a run fades the others back
- With prefers-reduced-motion everything changes at once

### Responsive

- Built on a container query; under 420px the limit pill steps aside (the limit stays on the chart) – the card keeps the same size as every agent chart card
- The oldest runs fade out at the left edge
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The scale follows the usual runs, not one outlier: room above the 90th percentile and the limit; a bar past it is cut at the top with a small break
- The legend shows up to four models – with more, the first three and "+n more"; keys that don't fit the line drop out of sight instead of squeezing
- tokens are plain counts; broken values are left out
- Keep about 20–40 runs – the latest stretch, not a history
- A run without a known model is drawn in gray
- Colors are variables on .ui-tbgc – --ui-tbgc-c0 … --ui-tbgc-c4 for the models, --ui-tbgc-pink over the limit

### Requirements

- React 19

Related: latency-range, tool-activity, token-flow, context-window

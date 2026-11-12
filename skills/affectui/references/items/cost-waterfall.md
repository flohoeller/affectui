# Cost Waterfall (Pro)

Where the money and tokens of an agent run go – every LLM call, tool call and sub-agent as a step in a waterfall, with model, tokens, cost and time, the most expensive step on top and a switch between cost and tokens

- Page: https://www.affectui.com/components/cost-waterfall
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/cost-waterfall.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/cost-waterfall-clean.json` (needs the Pro access key) – lands as `cost-waterfall-clean.tsx`, import from `@/components/ui/cost-waterfall-clean` – its docs: `cost-waterfall-clean.md`
- Import: `@/components/ui/cost-waterfall`

### When to use

- Showing what an agent run cost, and which steps spent it – next to a chat, in a run log or on a billing page
- Finding the expensive step: the bars step across to the total, so the long ones are where the money went
- Live runs, where new steps appear and the totals climb while the agent works

### When not to use

- When each step ran and how long it took – use Trace Waterfall
- Who started whom, at a glance – use Agent Tree
- A budget or quota over days and weeks – use Usage Meter

### Usage

```tsx
import { CostWaterfall, type CostStep } from "@/components/ui/cost-waterfall";

const steps: CostStep[] = [
  { id: "plan", name: "Plan the report", kind: "llm", status: "done", model: "Opus 5.5",
    tokensIn: 4120, tokensOut: 960, cost: 0.044, duration: 3000,
    input: "Write a report on LLM API prices…", output: "1. Research  2. Write  3. Review" },
  { id: "research", name: "Researcher", kind: "agent", status: "running", model: "Gemini 3.8 Flash", duration: 8500,
    children: [
      { id: "s1", name: "web_search", kind: "tool", status: "done", detail: "API prices 2026", cost: 0.01, duration: 1300,
        input: '{ "query": "LLM API pricing 2026" }', output: "10 results" },
    ] },
];

export function RunCost() {
  return <CostWaterfall steps={steps} task="Report on LLM API prices in 2026" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| steps | `CostStep[]` |  | { id, name, kind, status, model?, detail?, icon?, tokensIn?, tokensOut?, cost?, duration?, input?, output?, error?, children? } – the run's steps in order, sub-agents hold theirs as children |
| kind | `"agent" \| "llm" \| "tool"` |  | Per step – picks the bar's tint and what its details are called: Task/Result, Prompt/Response, Input/Output |
| status | `"running" \| "done" \| "failed"` |  | Per step – running steps shimmer, failed ones turn red with their error in the details |
| cost / tokensIn / tokensOut | `number` |  | Per step, its own – sub-agents add up their children, so don't pre-sum. A negative cost is a credit and steps the waterfall back |
| duration | `number` |  | Per step, in ms – how long it took or runs so far |
| input / output / error | `string` |  | Per step – the prompt and response, or the tool's input and output, shown when the row opens |
| task | `string` |  | What the run is about – muted next to the title |
| status | `"running" \| "done" \| "failed"` |  | Overrides the run's state in the bar – by default Live while a step runs |
| mode / defaultMode | `"cost" \| "tokens"` | `"cost"` | What the bars measure, controlled or uncontrolled |
| onModeChange | `(mode) => void` |  | The switch was used |
| collapsed / defaultCollapsed | `string[]` | `[]` | Ids of folded sub-agents, controlled or uncontrolled |
| onCollapsedChange | `(collapsed: string[]) => void` |  | A sub-agent was folded or opened |
| openId / defaultOpenId | `string \| null` | `null` | The step whose details are open, controlled or uncontrolled |
| onOpenChange | `(id: string \| null, step?: CostStep) => void` |  | Details opened (with the step) or closed |
| maxHeight | `number` |  | Long runs: the rows scroll past this height in px |
| formatCost | `(amount: number) => string` | `dollars, e.g. "$0.042"` | Formats every cost |
| title | `string` | `"Run cost"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the switch, the most expensive step and into the rows – the rows are one stop
- ArrowUp / ArrowDown: Moves between the rows; Home and End jump to the first and the last
- ArrowRight: Opens a folded sub-agent, or moves to its first step
- ArrowLeft: Folds an open sub-agent, or moves to its parent
- Enter / Space: Opens or closes the details of the focused step
- Esc: Closes the details and returns to the row – also from inside them

### Accessibility

- The rows are a tree: every step is a treeitem with its level, labelled with name, kind, status, cost, tokens and time; aria-expanded on sub-agents
- Roving focus – only one row is in the tab order, so the waterfall is a single stop
- The switch is two toggle buttons with aria-pressed in a labelled group
- "Most expensive" unfolds the step's sub-agents, opens it and moves focus to its row
- Long prompts and outputs scroll in their box and are then a tab stop, so the keyboard can scroll them
- The run's state (Live, Done, Failed) is announced politely when it changes; ticks and grid lines are hidden from assistive tech

### Motion

- New steps slide in as rows and their bars grow from where the step before ended
- A running step's bar has a sheen and a soft glow at its leading edge; numbers that still climb shimmer
- When the total outgrows the axis, it glides to the next round value and every bar follows
- Switching between cost and tokens glides every bar to its new place and length
- Details open under their row and close the same way; folding closes the sub-agent's rows
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query: wide, the steps sit on the left, the waterfall in the middle, the numbers on the right
- Under 720px the In and Out columns step aside – in the tokens view the step's tokens take the cost's place
- Under 520px each row stacks: name, cost and time on one line, the bar across the whole width under it
- Touch screens get larger targets for the switch and the chevrons
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole list every time something changes – ids keep rows in place, new ids slide in
- cost and tokens are the step's own; sub-agents add their children up
- NaN, Infinity and missing numbers show as – and count as zero; a negative cost is a credit
- For a live run update tokensOut, cost and duration of the running step as they come in
- Colors are variables on .ui-cwf, e.g. --ui-cwf-llm-bg / --ui-cwf-llm-edge for LLM calls
- The chevron and warning icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: trace-waterfall, agent-tree, usage-meter, agent-fleet

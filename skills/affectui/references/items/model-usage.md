# Model Usage (Pro)

How much each AI company's models were used – one stacked bar per company with a segment per model, switch between tokens, cost and requests, and see what it all went into

- Page: https://www.affectui.com/components/model-usage
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/model-usage.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/model-usage-clean.json` (needs the Pro access key) – lands as `model-usage-clean.tsx`, import from `@/components/ui/model-usage-clean` – its docs: `model-usage-clean.md`
- Import: `@/components/ui/model-usage`

### When to use

- Showing how much each AI company's models were used in a period – tokens, cost or requests – and how that splits across their models
- A usage or billing page for a team that runs several providers side by side
- Showing what the usage went into – search, analyze, code, test – across every model, or for one company

### When not to use

- Usage over time, day by day – use KPI Chart or Breakdown Chart
- Plan limits and credits left – use Usage Meter
- Where one run's money went, step by step – use Cost Waterfall

### Usage

```tsx
import { ModelUsage, type UsageCompany } from "@/components/ui/model-usage";

const companies: UsageCompany[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    logo: <ClaudeLogo />,
    models: [
      { id: "sonnet", name: "Claude Sonnet 5.5", usage: { tokens: 2_180_000, cost: 6.54, requests: 838 } },
      { id: "opus", name: "Claude Opus 5.5", usage: { tokens: 1_240_000, cost: 18.6, requests: 477 } },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    logo: <OpenAILogo />,
    models: [{ id: "gpt", name: "GPT-5.5", usage: { tokens: 1_520_000, cost: 15.2, requests: 585 } }],
  },
];

export function Usage() {
  return <ModelUsage companies={companies} previous={{ tokens: 4_100_000, cost: 31.4, requests: 1620 }} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| companies | `UsageCompany[]` |  | One bar each, in its color, with its logo and name under it |
| UsageCompany.models | `UsageModel[]` |  | A segment each – the most used at the bottom, darkest, the rest in lighter shades of the company's color |
| UsageModel.usage | `{ tokens?, cost?, requests? }` |  | What it used in the period, per measure – cost in dollars |
| UsageModel.tasks | `Record<kind, { tokens?, cost?, requests? }>` |  | What its usage went into – adds the task list below the bars |
| UsageCompany.color / logo | `string / ReactNode` |  | Its color (the palette in order by default) and its logo under the bar and in the card |
| metrics / defaultMetric | `UsageMetric[] / UsageMetric` |  | The measures to switch between, and the one shown first – tokens, cost, requests; one alone hides the switch |
| title | `string` |  | The period's name above the total – "This week" by default |
| previous / since | `{ tokens?, cost?, requests? } / string` |  | Last period's totals – adds "+38% since last week", green up, red down |
| kinds | `Record<string, { label, color, icon? }>` |  | Names, colors and icons for task kinds of your own, or to change the built-in ones |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Two stops: the measure switch, then the chart
- ← / →: Walk the bars – each shows its models in the card and its company's tasks below
- Home / End: The first, the last bar
- Esc: Close the card

### Accessibility

- The bars are buttons named with the company and its total; the card is a tooltip they point to
- The measure switch is a group of pressed buttons
- The task list is named after what it shows – all models, or the company pointed at
- Focus rings show for the keyboard only, in light and dark
- Color never carries meaning alone: every model and task is named with its value

### Motion

- The bars rise one after the other when the chart comes in
- Switching the measure resizes the bars and segments smoothly – they keep their order and shades
- Pointing at a bar fades the others and opens its card beside it
- Reduced motion turns it all off

### Responsive

- The classic style has a rounder card and bars, round task tiles and a pill switch – the same behavior as the clean one
- Fills its container's width; up to four or five companies read best
- Below 420px the switch moves under the total, company names give way to their logos, the tasks stack in one column and the card spans the chart
- Numbers stay short at any size: 2.24T tokens, $12.4M, 1.2M requests; a model's sliver of a bar reads "<1%"
- No usage at all shows "No usage this week" across the empty chart
- The card sits beside its bar – right of it on the left half, left of it on the right half – so it never covers the header
- Broken data holds: a value that isn't a number or below 0 counts as 0, a company without models stands empty with 0, a company without a logo shows its name only, an unknown task kind gets a grey square and its own name
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every company and model a stable id
- Pass the same measures for every model – tokens, cost in dollars, requests
- Model order comes from the first measure and stays when switching
- Task kinds use the built-in names – search, analyze, code, test, plan, read, write, check – so they get their icon and color

### Requirements

- React 19

Related: reasoning-summary, usage-meter, breakdown-chart, cost-waterfall

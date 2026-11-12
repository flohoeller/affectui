# Experiment Card (Pro)

An A/B test in two lines that quietly unfolds on hover – variants linked to a tiny chart, a metric switch with rolling numbers, and a winner you pick with a click

- Page: https://www.affectui.com/components/experiment-card
- Section: Components · Data display
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/experiment-card.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/experiment-card-clean.json` (needs the Pro access key) – lands as `experiment-card-clean.tsx`, import from `@/components/ui/experiment-card-clean` – its docs: `experiment-card-clean.md`
- Import: `@/components/ui/experiment-card`

### When to use

- A/B tests, prompt or model comparisons, pricing experiments – anything with a few variants measured the same way
- Lists of running experiments where the result should be one hover away
- When people should not only read the result but act on it: pick the winner and ship it

### When not to use

- More than about five variants – the head chart and the rows get crowded; use a table
- Results over time – a line chart shows when a variant pulled ahead; this card shows where things stand
- A single number without variants – use KPI Chart or Compact Breakdown

### Usage

```tsx
import { ExperimentCard } from "@/components/ui/experiment-card";

export function SignupCopyTest() {
  return (
    <ExperimentCard
      title="Signup button copy"
      status={{ label: "Running", tone: "green" }}
      note="Day 9 of 14"
      metrics={[
        { id: "conversion", label: "Conversion", format: (n) => `${n.toFixed(1)}%` },
        { id: "revenue", label: "Revenue", format: (n) => `$${n.toFixed(2)}` },
      ]}
      variants={[
        { id: "a", key: "A", name: "Start free trial", control: true, visitors: 4790, values: { conversion: 4.2, revenue: 18.4 } },
        { id: "b", key: "B", name: "Try it free", visitors: 4812, values: { conversion: 4.7, revenue: 19.1 }, confidence: { conversion: 96, revenue: 81 } },
      ]}
      action={{ label: (v) => `Ship ${v.key}`, onClick: (v) => ship(v.id) }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Name of the experiment |
| variants | `ExperimentVariant[]` |  | { id, key, name, values, control?, visitors?, confidence?, color? } – values and confidence hold one number per metric id; key is the short letter in the badge |
| metrics | `ExperimentMetric[]` |  | { id, label, format?, lowerIsBetter? } – the switch above the rows; no switch with a single metric |
| metric | `string` |  | Controlled metric id |
| defaultMetric | `string` | `first metric` | Starting metric when uncontrolled |
| onMetricChange | `(id: string) => void` |  | Called with the new metric |
| winner | `string \| null` |  | Controlled id of the picked variant |
| defaultWinner | `string \| null` | `null` | Picked variant when uncontrolled |
| onWinnerChange | `(id: string \| null) => void` |  | Called when a variant is picked, or null when the pick is taken back |
| status | `{ label: string; tone?: ExperimentTone }` |  | The tag under the title – tone is red, amber, green, blue, violet or gray |
| note | `string` |  | Short text next to the status, e.g. "Day 9 of 14" |
| action | `{ label: string \| (variant) => string; onClick: (variant) => void }` |  | The button that appears on the tray once a winner is picked |
| hint | `ReactNode` | `"Pick a winner"` | The line on the tray while nothing is hovered or picked |
| trigger | `"hover" \| "click"` | `"hover"` | Hover opens under the mouse; taps and the keyboard always toggle |
| open | `boolean` |  | Controlled open state |
| defaultOpen | `boolean` | `false` | Starts open when uncontrolled |
| onOpenChange | `(open: boolean) => void` |  | Called when the card opens or closes |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter / Space: On the card: opens or closes it
- ← / →: In the metric switch: previous or next metric (wraps around)
- Tab: Through the metric switch, the variants and the action
- Space: On a variant: picks it as the winner, or takes the pick back
- Esc: Closes the card and returns focus to it

### Accessibility

- The head is one button with aria-expanded; its name carries the status and who is ahead
- The metric switch and the variants are radio groups; every variant's name includes its value and its change against the baseline
- The small chart in the head is decorative – everything it shows is in the rows
- While the card is closed, everything inside is inert; the line on the tray is announced politely

### Motion

- Nothing travels: the head stays where it is and the comparison unfolds below it while it fades in
- Switching the metric rolls every number in one shared tween while bars and columns glide to their new size; the pill of the switch slides along
- Hovering a variant widens its column in the head and fades the others – and the other way round
- Picking a winner turns its badge into a check and pops the action onto the tray
- With prefers-reduced-motion everything switches without movement

### Responsive

- Fills its container up to 340px; below 300px the note next to the status goes and the chips tighten
- Touch screens: a tap opens, a tap outside closes, rows and the metric switch are taller
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Changes are measured against the control (the variant with control: true, else the first). With lowerIsBetter a drop is shown as it is (−7.5%) but colored green and counted as the lead
- Pass raw numbers and do the formatting in the metric's format, so the rolling values stay smooth
- The card does not compute confidence – pass what your stats engine gives you

### Requirements

- React 19

Related: project-card, compact-breakdown, kpi-chart

# Tool Activity, clean style (Pro)

Which tools an agent used, day by day, as a field of dots – each lights up in its tool's color, the stronger the busier, with today's calls and the total on top

- Page: https://www.affectui.com/components/tool-activity
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/tool-activity-clean.json` (needs the Pro access key)
- Import: `@/components/ui/tool-activity-clean`

### When to use

- Which tools an agent reached for, day by day – and how busy it was – at a glance
- A dashboard tile next to other agent chart cards, live as today's calls come in

### When not to use

- Which tools an agent may use at all – use Tool Access Map
- One run's tool calls in order – use Tool Call Card or Trace Waterfall

### Usage

```tsx
import { ToolActivity, type ActivityTool, type ActivityDay } from "@/components/ui/tool-activity-clean";

const tools: ActivityTool[] = [
  { id: "search", name: "Web search" },
  { id: "code", name: "Code runner" },
  { id: "db", name: "Database" },
];

const days: ActivityDay[] = stats.map((s) => ({
  label: s.day, // "14"
  counts: { search: s.search, code: s.code, db: s.db },
}));

<ToolActivity title="Research agent activity" tools={tools} days={days} onAction={() => openAgent()} />
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tools | `ActivityTool[]` |  | { id, name, color? } – one row each, top to bottom; colors default to blue, pink, purple, cyan, orange, green, teal, amber |
| days | `ActivityDay[]` |  | { label, counts } – oldest first, the last one is today; counts are per tool id, labels must be unique |
| unit | `string` | `"calls"` | What a count is |
| title | `string` | `"Tool Activity"` | Heading on the frame |
| icon | `ReactNode` |  | A small mark before the title – defaults to a bolt, in orange |
| actionLabel / onAction | `string / () => void` | `"Open"` | The button on the top right – it shows when onAction is given |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves into the dots (one stop) and on to Open
- ArrowLeft / ArrowRight / ArrowUp / ArrowDown: Walks the days and tools and shows each one's calls; Home and End jump to the first and the last day
- Esc: Lets go of the dot

### Accessibility

- The dots are a single tab stop; the dot you're on is its description – tool, day and calls
- The total, today's calls and how many days and tools it covers are plain text

### Motion

- Dots appear in a quick diagonal wave; a dot that lights up for the first time pops once
- Picking a dot fades everything that isn't on its day or its tool
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query; under 400px the two columns get tighter and the dots smaller – the card keeps the same size as every agent chart card
- The oldest days fade out at the left edge; every other day is labelled
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Eight colors before they repeat – --ui-aact-c0 … --ui-aact-c7; give a tool its own color to keep it fixed
- Day labels thin out with many days or long labels; the total gets short (128k, 1.29M) when it grows
- Each tool's dots are measured against its own busiest day, so a quiet tool still reads
- Keep about 10–21 days and up to six tools – it's a fortnight at a glance
- Colors are variables on .ui-aact – --ui-aact-c0 … --ui-aact-c7 for the tools, --ui-aact-off for unused days

### Requirements

- React 19

Related: latency-range, run-transit, tool-access-map, agent-fleet

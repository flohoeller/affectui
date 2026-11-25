# Agent / Model Usage (Pro)

How a project's agents use AI models – runs, success rate and tokens in one strip, tokens by model as a line per model, and every model as a row with its share, cost and last run

- Page: https://www.affectui.com/screens/agent-analytics
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-analytics.json` (needs the Pro access key)
- Import: `@/components/ui/agent-analytics`

### When to use

- Showing which AI models a project's agents use, how much and how well – for platform, ops or finance teams
- An analytics page with a project switch, a row of key numbers, a multi-line chart and a table that belong together

### When not to use

- Spend by provider and team in a chat – use AI Chat / Spend Planner
- One agent's tool calls – use Agent / Tool Calls

### Usage

```tsx
import { AgentAnalyticsScreen } from "@/components/ui/agent-analytics";

export default function Page() {
  return (
    <AgentAnalyticsScreen
      project="Support Copilot"
      models={(range) => usage[range]} // [{ id, name, maker, logo?, color, runs, tokens, cost, success, change: { runs, tokens }, lastUsed, daily }]
      onExport={(range) => download(range)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| project | `string` | `"Support Copilot"` | The project in the head – a click opens the switch to `projects` |
| projects | `{ name; sub? }[]` |  | The projects in the switch, with a line under each |
| models | `AanModel[] \| (range) => AanModel[]` |  | The models over the period – name, maker and logo, a color for its line, runs, tokens, cost, success (0–1), the change since the period before, when it last ran and its tokens per day. Left out, a sample that scales with the period |
| today | `Date` |  | The last day of the period – the chart counts back from it |
| onTab | `(tab) => void` |  | Called when another tab is picked |
| onExport | `(range) => void` |  | Export |
| loading | `boolean` |  | Gray numbers, chart and rows |
| empty | `boolean` |  | No runs yet – dashes in the strip and a note in place of the chart |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / →: Between the tabs and the periods
- Tab: To the legend's models, then the rows
- ↑ / ↓: From row to row
- Enter: On a row: show just that model in the chart, again for all; on a legend item: show or hide its line

### Accessibility

- Each row is named with the model, its maker and all its numbers; the legend's items are toggle buttons
- The chart is the library's Trend Chart – focusable, its points read out as you step through them
- Rings show for the keyboard only – inside the edge for rows and segment buttons

### Motion

- Pointing at a row or a legend item fades the other lines so its own stands out
- Bars grow to a new period's share

### Responsive

- The strip of numbers goes two by two on narrower screens, the table drops success and last used
- On phones the table keeps the model, runs and tokens; the chart keeps its full width
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell and Trend Chart (installed with it)

Related: agent-usage, analytics, trend-chart, model-usage

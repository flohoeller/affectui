# Analytics (Pro)

Revenue dashboard: key figures, revenue by channel, breakdown, top products and weekly trends

- Page: https://www.affectui.com/screens/analytics
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/analytics.json` (needs the Pro access key)
- Import: `@/components/ui/analytics`

### When to use

- Revenue, product or marketing dashboards
- Overview pages that combine key figures and charts

### When not to use

- Live monitoring with many changing values – use a denser layout

### Usage

```tsx
import { AnalyticsScreen } from "@/components/ui/analytics";

export default function Page() {
  return <AnalyticsScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: the key figures, charts, breakdown and top products show gray placeholders in the shape of the real ones, in the same cards |
| empty | `boolean` |  | No data yet: the header stays, the key figures and charts give way to one empty state – “No revenue yet”, a line on what shows up here and a Connect store button |
| onConnect | `() => void` |  | Called by the empty state’s Connect store button |
| className | `string` |  | Extra class on the root |
| stats | `{ label: string; value: string; delta: string; bars: number[]; good?: "up" \| "down" }[]` |  | Key figures on top – shown as given; good says which way of the delta is good news |
| breakdown | `{ label: string; value: string; spark: number[]; tone?: "up" \| "down" \| "flat" }[]` |  | Lines of the revenue breakdown |
| products | `{ label: string; value: string; share: number }[]` |  | Top products, share in % of the best one |
| channels | `KpiSeries[]` |  | Lines of the revenue chart, one value per day |

### Accessibility

- Sidebar items, tabs and toolbar actions are real buttons with labels
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, KPI Chart and Button (installed with it)

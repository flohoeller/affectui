# Agent / Usage (Pro)

What your agent costs – the month added up day by day against the budget, where it lands at this pace in one plain line, money ticking up as runs finish, where it went by project or model, and what's worth a look

- Page: https://www.affectui.com/screens/agent-usage
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-usage.json` (needs the Pro access key)
- Import: `@/components/ui/agent-usage`

### When to use

- Showing what an agent costs this month – against a budget, and where it lands at this pace
- Answering where the money went – by project or by model – and what stands out
- Making spend feel live: the sum moves as runs finish

### When not to use

- One run's cost, call by call – use Agent / Orchestration or the Cost Waterfall
- Plans and invoices – use Settings / Billing
- Product analytics – use Analytics

### Usage

```tsx
import { AgentUsageScreen } from "@/components/ui/agent-usage";

export default function Page() {
  const { days, projects, models, notes, latestRun } = useUsage("2026-11");
  return (
    <AgentUsageScreen
      days={days}              // what it cost each day so far – the last is today
      daysInMonth={30}
      budget={500}
      currency="EUR"
      projects={projects}
      models={models}
      notes={notes}
      latest={latestRun}       // a new id plays "+€0.42 · Ingest pipeline"
      onOpenNote={(note) => router.push("/runs/" + note.id)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| days | `number[]` | `19 sample days` | What it cost each day of the month so far – the last one is today. The curve adds them up; the pace of these days makes the dashed forecast |
| daysInMonth | `number` | `30` | How many days the month has |
| budget | `number \| null` | `500` | The month's budget – the curve draws it as a line and the sentence says on which day it would be passed; null for none |
| currency | `string` | `"EUR"` | ISO 4217 code – every amount is formatted with it |
| projects / models | `{ id; name; amount; last?; tone?; days?; tasks?: { title; runs; cost }[] }[]` |  | Where it went – amount this month, last for the change on last month, tone a palette name or any color, days for the panel's bars, tasks for what cost the most |
| notes | `{ id; kind: "spike" \| "jump" \| "budget"; text; detail?; badge? }[]` |  | What's worth a look – Open calls onOpenNote (or onNavigate("Runs")) |
| stats | `{ tasks?; runs?; tokens? }` |  | The month's numbers under the curve – with tasks it also shows the cost per task |
| latest | `{ id; task; cost } \| null` |  | The run that just finished – a new id plays its moment: the sum ticks up and "+€0.42 · task" shows beside it |
| defaultView | `"projects" \| "models"` | `"projects"` | What Where it went shows first |
| defaultSelected | `string \| null` | `"northwind"` | The project or model open on the right |
| onOpenNote | `(note: UsageNote) => void` |  | Called with Open on a note |
| onSelect | `(view, id) => void` |  | Called when a project or a model is opened |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| labels | `{ usage?; month?; monthShort?; spent?; onTrack?; over?; whereItWent?; worthALook?; … }` |  | Labels, e.g. for a translation – onTrack and over take {amount}, {budget} and {date} |
| loading | `boolean` |  | While your data loads: gray spend card, curve, rows, notes and panel in the shape of the real ones; the header, labels and the Projects | Models switch stay |
| empty | `boolean` |  | Nothing spent yet: the page shows Nothing spent yet with a sentence on when spend shows up and a Start a task button (calls onNavigate with "Tasks"); the breakdown and notes hide and the Details panel shows nothing open |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / →: On the curve: day by day – what it cost that day and the sum so far
- Home / End: On the curve: the first day, today
- Esc: On the curve: hide the day
- ← / →: Projects / Models: switch what Where it went shows
- Tab / Enter: Every project, model and note is a button – Enter opens it

### Accessibility

- The curve is one image whose name says it all – the sum so far, the budget and where it lands; ← → read it day by day through a live line
- Each project or model is a button named with its amount, its share and its change on last month
- The run that just finished is said once through a status line: "+€0.42 · Ingest pipeline"
- Color is never the only sign: the change has its arrow, a warning its icon and words
- Rings show for the keyboard only

### Motion

- One moment: as a run finishes the sum's digits roll into place like an odometer – only the ones that change, up from below, fading at the edges – today's point rises on the curve and "+€0.42 · task" shows for a moment
- Every number that changes rolls the same way – the forecast in the sentence, the share, runs and tokens, a project's amount; going down they roll the other way
- On load the curve draws itself in and its fill fades up; today's point breathes; the bars grow from the left
- With prefers-reduced-motion nothing draws, breathes or grows

### Responsive

- Fills its container; the page keeps a readable 720px column and the curve takes its full width
- Below 620px the numbers stack two by two, the bars make room for name, amount and change, and a note's badge and Open move under its text
- Amounts keep their column at any size – €1.28M in a row with the whole amount in its tooltip and the panel; a change of thousands of percent reads as a factor (↑12×); every currency gets its own decimals (€270.40, ¥43,264)
- Touch targets grow to 36px on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-permissions, agent-orchestration, cost-waterfall

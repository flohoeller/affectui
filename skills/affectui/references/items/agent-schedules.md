# Agent / Schedules (Pro)

What your agent does again and again – the hours around now on one line, each run a mark that fills while it runs; every schedule with its rhythm in words, its next run, how the last ended, what a run costs and a switch to pause it

- Page: https://www.affectui.com/screens/agent-schedules
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-schedules.json` (needs the Pro access key)
- Import: `@/components/ui/agent-schedules`

### When to use

- Showing what an agent does on its own on a rhythm – every morning, every two hours, on the first of the month
- Seeing at a glance what ran, what runs now and what's next
- Pausing a schedule, skipping one run or starting one now

### When not to use

- One-off tasks – use Agent / Tasks
- What it did step by step – use Agent / Activity
- A calendar of meetings – use a calendar

### Usage

```tsx
import { AgentSchedulesScreen } from "@/components/ui/agent-schedules";

export default function Page() {
  const [schedules, setSchedules] = useState(initialSchedules);
  return (
    <AgentSchedulesScreen
      schedules={schedules}          // runs: past and coming times; duration: how long a run takes
      onPause={(id, paused) => api.pause(id, paused)}
      onRunNow={(id) => api.runNow(id)}
      onSkip={(id, at, skipped) => api.skip(id, at, skipped)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| schedules | `{ id; name; project?; tone?; prompt?; cadence; runs: number[]; duration?; paused?; history?: { at; outcome: "done" \| "needs" \| "failed"; summary; cost? }[]; cost? }[]` |  | Every schedule. cadence is its rhythm in words; runs are its past and coming times in ms – the line shows the ones around now, the panel the next five; duration is how long a run takes, and the ring fills over it; history is how the last runs ended, newest first; cost is what a run costs on average. Pass a stable array (state) |
| defaultSelected | `string \| null` | `"scan"` | The schedule open on the right when the screen starts |
| onPause | `(id, paused) => void` |  | Called when a schedule is paused or resumed – from its switch or the panel |
| onRunNow | `(id) => void` |  | Called with Run now – the run shows up on the line at once and fills over the schedule's duration |
| onSkip | `(id, at, skipped) => void` |  | Called when one coming run is skipped or restored |
| onSelect | `(id) => void` |  | Called when a schedule is opened |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| labels | `{ schedules?; aroundNow?; runningNow?; next?; pause?; resume?; runNow?; skip?; … }` |  | Labels, e.g. for a translation |
| loading | `boolean` |  | While your schedules load: a gray chart, gray rows and a gray Schedule panel, in the shape of the real ones (the shared Skeleton) |
| empty | `boolean` |  | No schedules at all: the page shows No schedules yet with a sentence on how to make one and an Ask in Thread button (calls onNavigate with "Thread"); the Schedule panel shows nothing open |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K / ↑ / ↓: From schedule to schedule
- Enter: Open the schedule on the right – or, on a mark of the line, the schedule it belongs to
- Space: On a switch: pause or resume
- Tab: The marks on the line, each schedule and its switch, then the panel's Run now, Pause and Skip

### Accessibility

- The chart itself is decoration; each run marker on it is a button named with its schedule, its time and whether it ran, failed, runs (with how far) or is still to come
- What runs or comes next is said in words under the line, as a status: "Running now: Competitor scan · 38%"
- The switch is a role="switch" named with the schedule and what it does
- Outcomes are badges with words – Done, Needs you, Failed – never color alone
- Rings show for the keyboard only

### Motion

- One moment: when now reaches a run, the activity line climbs at its glowing head and a chip beside it says what's running and how far; when the run ends the line settles and its marker stays
- The chart moves with the clock: the line grows at the head and coming markers slide toward now
- Run now starts that moment at once
- With prefers-reduced-motion nothing glows or blinks – the line and chip still show the run

### Responsive

- Fills its container; the page keeps a readable 760px column and the line takes its full width
- Rows are one line like a board's list – name, rhythm, next run, last outcome, cost and switch; below 640px outcome and cost move to the panel
- Below 440px a row takes three short lines – name, rhythm, next run – with its mark beside the first
- Long names and rhythms end in '…' with the whole in a tooltip and the panel; a long brief shows six lines with Show all; a big cost shortens to €1.3K in its column
- Touch targets grow to 36px and the switch to 40 × 24 on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-tasks, agent-activity, agent-usage

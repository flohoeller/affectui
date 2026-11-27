# Run Window, clean style (Pro)

When an agent may run, as a block on a time ruler with its pixel mark and a thin line for now – drag the window or its grips to move it

- Page: https://www.affectui.com/components/run-window
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/run-window-clean.json` (needs the Pro access key)
- Import: `@/components/ui/run-window-clean`

### When to use

- When an agent may run – a nightly reindex, a sync window, quiet hours for outreach – and letting people move that window
- A dashboard tile next to other agent chart cards, with now moving along

### When not to use

- A list of upcoming runs – use Scheduled Runs
- How far one run is – use Run Transit

### Usage

```tsx
import { RunWindow } from "@/components/ui/run-window-clean";

const [win, setWin] = useState<[number, number]>([9 * 60, 10 * 60]);

<RunWindow
  title="Nightly reindex"
  range={[8 * 60 + 30, 11 * 60 + 30]}
  start={win[0]}
  end={win[1]}
  now={minutesSinceMidnight}
  onChange={(start, end) => setWin([start, end])}
  agent={{ id: "indexer", name: "Indexer" }}
  label="Reindex search"
/>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| range | `[number, number]` |  | The ruler, in minutes from midnight – e.g. [510, 690] for 08:30 to 11:30 |
| start / end | `number` |  | The window, in minutes from midnight; kept inside the ruler and at least two steps long |
| now | `number` |  | Now, in minutes – a thin line; before the window it says when it starts, inside it the part behind now is strong |
| onChange | `(start, end) => void` |  | Makes the window movable – drag it, drag its grips, or use the arrow keys |
| step | `number` | `5` | What the window snaps to, in minutes |
| agent | `{ id: string; name: string }` |  | The agent that runs in it – its pixel mark and name sit in the window |
| label | `string` | `"Run"` | What runs – under the ruler, with the window's length |
| title | `string` | `"Run Window"` | Heading on the frame |
| icon | `ReactNode` |  | A small mark before the title – defaults to a calendar, in red |
| actionLabel / onAction | `string / () => void` | `"Open"` | The button on the top right – it shows when onAction is given |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves to the window, its start grip, its end grip and Open
- ArrowLeft / ArrowRight: On the window: moves it by a step; on a grip: moves that end. With Shift: 30 minutes

### Accessibility

- The window and both grips are sliders that read their times, e.g. "09:00 to 10:00"
- How long it is and when it starts are plain text under the ruler

### Motion

- The window glides to every new place; now moves along the ruler
- While it runs, a light sweeps over the part behind now and the agent's mark twinkles
- With prefers-reduced-motion everything changes at once

### Responsive

- Built on a container query; under 420px the agent's name and the ruler's own times step aside – the card keeps the same size as every agent chart card
- The ruler's own times step aside when the window's are close to them
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- When the window is short its start and end join into one label ("23:50–00:00"); times at the edges lean inward so they never run out of the card
- The ruler's ticks follow the range – every 15 minutes, every hour or every three hours
- All times are minutes from midnight; labels wrap around the clock, so a ruler can run past midnight (e.g. 1320 to 1560)
- Without onChange the window can't be moved and its grips stay quiet
- Colors are variables on .ui-rwnc – --ui-rwnc-from and --ui-rwnc-to for the window, --ui-rwnc-icon for the icon

### Requirements

- React 19

Related: run-transit, agent-time-split, scheduled-runs, latency-range

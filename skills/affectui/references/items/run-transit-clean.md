# Run Transit, clean style (Pro)

An agent carrying a job from one place to another like a flight on its way – where it comes from, where it goes, the time left and a bar its pixel mark rides on

- Page: https://www.affectui.com/components/run-transit
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/run-transit-clean.json` (needs the Pro access key)
- Import: `@/components/ui/run-transit-clean`

### When to use

- An agent moves something from one place to another – a migration, a sync, an import, a deploy – and people want to see how far it is and when it lands
- A dashboard tile for one long-running job, next to other agent tiles

### When not to use

- Many tasks at once – use Fan-out Grid
- Where the time of one run goes, step by step – use Trace Waterfall
- A task travelling through several agents – use Handoff Relay

### Usage

```tsx
import { RunTransit } from "@/components/ui/run-transit-clean";

<RunTransit
  title="Customer migration"
  from={{ code: "Postgres", label: "prod-eu-1" }}
  to={{ code: "Supabase", label: "eu-central-1" }}
  progress={0.62}
  eta={5 * 60_000}
  agent={{ id: "migrator", name: "Migrator" }}
  onAction={() => openRun()}
/>
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| from / to | `{ code: string; label?: string }` |  | Where the job comes from and where it goes – a large name and a muted line under it |
| progress | `number` |  | How far it is, 0 to 1 |
| eta | `number` |  | Time left in ms – shown in the pill while it runs |
| took | `number` |  | How long it took in ms – shown in the pill once it's done |
| status | `"running" \| "paused" \| "done" \| "failed"` | `"running"` | Running sweeps a light over the bar; paused rests; done fills it; failed turns it pink |
| agent | `{ id: string; name: string }` |  | The agent doing it – its id picks the pixel mark that rides at the head of the bar |
| title | `string` | `"Run Transit"` | Heading on the frame |
| icon | `ReactNode` |  | A small mark before the title – defaults to a route, in cyan |
| actionLabel / onAction | `string / () => void` | `"Open"` | The button on the top right – it shows when onAction is given |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves to Open

### Accessibility

- The bar is a progressbar with its percentage; its label says who carries what where and how long is left
- Open is a plain button with a visible focus ring

### Motion

- The fill glides to every new progress value; a light sweeps over it while the agent works and its head glows
- The agent's pixel mark twinkles in a diagonal wave at the head of the bar; it rests when paused, done or failed
- The pill swaps its text in place with a small rise when the status changes
- With prefers-reduced-motion everything changes at once

### Responsive

- Built on a container query; under 360px the names get smaller and the card tighter
- Long names end in an ellipsis and show in full on hover
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Long agent or place names end in an ellipsis on both sides; the pill in the middle always keeps its full text
- progress is 0–1, eta and took are ms – broken values (NaN, below 0, above 1) are clamped
- Pass status="done" with took once the job has landed – the bar fills and the pill says how long it took
- The agent is drawn with affectUI's pixel mark from its id – keep ids stable
- Colors are variables on .ui-rtrc – --ui-rtrc-from, --ui-rtrc-to and --ui-rtrc-end for the bar, --ui-rtrc-pink for the time, --ui-rtrc-icon for the icon

### Requirements

- React 19

Related: handoff-relay, fan-out-grid, trace-waterfall, agent-timing

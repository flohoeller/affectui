# Agent Metro Map (Pro)

A multi-agent run drawn as a metro map – every agent a line in its own color, every step a station, and where agents hand work over their lines meet at an interchange. Lines run straight and bend at 45°; each agent rides its line as a small white train with its pixel mark, the stretch behind it solid, the stretch ahead faint – when it moves on, the train glides to the next station, the line fills in behind it and a light runs ahead. A station waiting for you turns amber and can be approved in its card. The lines are listed on top with their model's logo; point at a line or a station and it comes forward, click one and its card opens

- Page: https://www.affectui.com/components/agent-metro-map
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-metro-map.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-metro-map-clean.json` (needs the Pro access key) – lands as `agent-metro-map-clean.tsx`, import from `@/components/ui/agent-metro-map-clean` – its docs: `agent-metro-map-clean.md`
- Import: `@/components/ui/agent-metro-map`

### When to use

- Showing a run where several agents work at once – who's where, where their work meets, what's still ahead
- A release, a launch or an onboarding as a route people read at a glance, like a metro map
- Runs with a stop where a person has to approve, right on the map

### When not to use

- One agent's states and how often it moved between them – use Agent State Machine
- Who does what when, lane by lane – use Handoff Swimlanes
- Every message and tool call in order – use Agent Sequence

### Usage

```tsx
import { AgentMetroMap, type MetroLine, type MetroStation } from "@/components/ui/agent-metro-map";

const stations: MetroStation[] = [
  { id: "brief", label: "Brief", col: 0, row: 1 },
  { id: "split", label: "Split work", col: 1, row: 1 },
  { id: "code", label: "Write fix", col: 2, row: 0, labelSide: "above", tools: [{ name: "GitHub", logo: <GitHubLogo /> }] },
  { id: "notes", label: "Draft notes", col: 2, row: 2 },
  { id: "review", label: "Review", col: 3, row: 1 },
  { id: "prod", label: "Production", col: 4, row: 1, status: "waiting" },
];

const lines: MetroLine[] = [
  { id: "planner", name: "Planner", model: "Claude Opus 5.5", logo: <ClaudeLogo />, stations: ["brief", "split", "review", "prod"], at: "review", status: "running" },
  { id: "coder", name: "Coder", model: "GPT-5.5 Codex", logo: <OpenAILogo />, stations: ["split", "code", "review"], status: "done" },
  { id: "writer", name: "Writer", model: "Gemini 3 Pro", logo: <GeminiLogo />, stations: ["split", "notes", "review"], at: "notes", status: "running" },
];

export function Release() {
  return <AgentMetroMap title="Ship v2.4" lines={lines} stations={stations} onApprove={(s) => api.approve(s.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| stations | `MetroStation[]` |  | { id, label, col, row, labelSide?, status?, detail?, tools?, duration? } – col and row place it on the map's grid |
| labelSide | `"below" \| "above" \| "left" \| "right"` |  | Where its name should go – below by default; if a line leaves on that side or another name sits there, it moves to the next free spot around the station |
| status (station) | `"waiting" \| "failed"` |  | Waiting turns amber and can be approved in its card, failed turns red; done and current follow from where the trains are |
| lines | `MetroLine[]` |  | { id, name, stations, at?, status?, color?, model?, logo? } – one per agent, its stations in order |
| at | `string` |  | The station its train is at – the stretch behind is the full color, the stretch ahead see-through |
| status (line) | `"running" \| "done" \| "idle"` |  | Idle – not started, no train; done – arrived, the whole line in full color |
| color / model / logo | `string / string / ReactNode` |  | The line's color – the first is blue, then a palette – and the model with its maker's logo, in the legend and the line's card |
| onApprove / onReject | `(station) => void` |  | Show Approve and Reject in the card of a waiting station – the card closes after either |
| onSelect | `({ station } \| { line } \| null) => void` |  | A station's or a line's card opened or closed |
| title / className | `string` |  | The heading and the section's accessible name, and an extra class on the root |

### Accessibility

- Every station and every line in the legend is a button with aria-expanded – Enter or Space opens its card
- A station reads as its name, whether it's an interchange, its lines and its state – "Review – interchange, Planner and Coder lines, a train is here"
- A line reads as its agent, its model, where its train is and how far it has come – "Coder line, GPT-5.5 Codex – at Tests, 3 of 5 stations"
- A card opened with the keyboard takes focus – on a waiting station straight to Approve; Esc closes it from anywhere and focus goes back
- The lines, the trains and the light are decoration and hidden from screen readers – each line's card lists its stations
- A focus ring shows only for the keyboard
- The classic style has a rounder card with a hairline border, pill-shaped line chips, tags and buttons and firmer type – the same behavior as the clean one

### Motion

- On first view the lines fade in one after another, then the stations
- When a train moves on it glides along its line to the next station, the line fills in behind it and a short light runs ahead
- Each train carries its agent's pixel mark, twinkling while it runs; a waiting station breathes softly
- Pointing at a line or a station brings it forward and fades the rest
- Reduced motion turns all of it off – the trains simply jump

### Responsive

- Fills its container's width – the columns spread out up to a comfortable distance
- Short of room the whole map scales down to fit – it never scrolls sideways
- Lines run straight and bend at 45°; at a station a line always runs through its middle
- Lines between the same two stations run side by side, like on a real metro map; a line passing a station it doesn't stop at is drawn through it – lay stations so lines don't run over each other
- Stations without a place on the grid, lines' stops that don't exist and repeated ids are left out; a train whose station doesn't exist starts at the first one
- Station names go where no line leaves the station and no other name sits – eight spots around it – on a patch of the card's color; long names end in …
- Cards open below what you clicked, above it near the bottom of the screen
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Lay the stations out on a small grid – one column per step, one row per line – and let lines meet at the stations where agents hand work over
- Keep station names to one or two words; the detail goes in detail
- Give a station above the top line labelSide "above" so its name doesn't sit on a line
- Update each line's at and status from the run's events; give a station status "waiting" while a person has to act

### Requirements

- React 19

Related: agent-state-machine, handoff-swimlanes, agent-sequence, agent-tree

# Agent Crew (Pro)

A lead and its sub-agents as one live tree of cards – every agent stays on screen; each card says what the agent does right now, how full its context is, its tools and the last thing it was handed, and handoffs run as a light along Agent Tree's rounded connectors and light up the card they reach; a click on a card opens its task, model, usage and tools with actions to steer it, and a switcher swaps between projects

- Page: https://www.affectui.com/components/agent-crew
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-crew.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-crew-clean.json` (needs the Pro access key) – lands as `agent-crew-clean.tsx`, import from `@/components/ui/agent-crew-clean` – its docs: `agent-crew-clean.md`
- Import: `@/components/ui/agent-crew`

### When to use

- A multi-agent run where every agent should stay in view – who works right now, who rests, who hands what to whom
- A dashboard or side panel that shows, per agent, what it's doing, how full its context is and what it was handed last
- Watching several projects' crews from one place – switch between them and step in where an agent needs you

### When not to use

- Agents that come and go, with cost, time and approvals per card – use Agent Tree
- One agent's steps – use Agent Trail
- A full conversation between agents – use Collaboration Stream

### Usage

```tsx
import { useState } from "react";
import { AgentCrew, type CrewAgent, type CrewHandoff } from "@/components/ui/agent-crew";

const root: CrewAgent = {
  id: "lead",
  name: "Lead",
  model: "Claude Opus",
  status: "active",
  activity: "Assigning the patch",
  context: 0.29,
  contextLimit: 200_000,
  children: [
    { id: "research", name: "Researcher", status: "done", activity: "Found the cause", context: 0.52 },
    {
      id: "coder",
      name: "Coder",
      status: "active",
      activity: "Editing cart.ts",
      context: 0.38,
      last: { from: "Lead", text: "Guard empty carts" },
      children: [{ id: "lint", name: "Linter", status: "idle", activity: "Idle" }],
    },
  ],
};

export function Crew() {
  const [handoffs, setHandoffs] = useState<CrewHandoff[]>([]);
  return <AgentCrew title="Fix the checkout crash" root={root} handoffs={handoffs} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| root | `CrewAgent` |  | The lead – its children sit side by side below it, their children hang under them as smaller cards |
| CrewAgent.status | `"active" \| "idle" \| "paused" \| "waiting" \| "done" \| "failed"` |  | active twinkles its pixel mark and shimmers its line; idle, paused and done rest; waiting and failed show their color – every card stays fully visible |
| CrewAgent.activity | `string` |  | One line – what it's doing, or resting, what it did last |
| CrewAgent.context / contextLimit | `number / number` |  | How full its context window is (0–1), as a thin bar in the agent's color – orange from 80%, red from 95% – and its size in tokens for "136k / 200k" |
| CrewAgent.model / tools / last | `string / { logo, name }[] / { from, text }` |  | The model under its name, the tools as small tiles (by name in the details) and the last thing it was handed |
| CrewAgent.task / modelLogo / started / ended / cost | `string / ReactNode / number / number / number` |  | In the details a click opens, as wide as the card: what it was asked, its model with the maker's logo, its usage (time – counting while it works – cost and tokens), its tools by name and the last thing it was handed |
| CrewAgent.logo | `ReactNode` |  | A mark instead of its pixel pattern |
| handoffs | `{ id, from, to, label? }[]` |  | Each new id runs a light along the connectors – through the agents between them – and the card it reaches lights up: a Gradient Floor in that agent's color rises from the edge it came in by and fades. The ones there on mount don't run |
| title | `string` |  | The header's name, with how many agents work, need you and how many there are |
| projects / project / onProjectChange | `{ id, name, working?, needsYou? }[] / string / (id) => void` |  | A project switcher takes the title's place, top left – each project with how many of its agents work or need you. Pass the chosen project's crew as root: its cards rise in and the connectors draw themselves |
| onSteer | `(agent, action, message?) => void` |  | Adds steering to the details: Message (a short instruction) always, Pause and Stop while it works, Resume when paused, Approve / Decline when it needs you, Retry when it failed – update the agent from your data |
| onSelect | `(agent) => void` |  | A click or Enter on a card – its details open as well |
| formatCost | `(amount) => string` | `dollars` | Formats the cost in the details – "$0.52", "<$0.01" |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Moves into the crew – one stop for all cards – then to the project switcher
- ← / → / ↑ / ↓: Walks the cards
- Home / End: The lead, the last card
- Enter / Space: Opens or closes the card's details
- Esc: Closes the message field, then the details – focus goes back to the card
- ↑ / ↓ / Enter: In the project switcher: picks a project; Esc closes it

### Accessibility

- A tree; every card is named with its status, activity and context – "Coder: Working, Editing cart.ts, context 38%" – and says it opens a dialog
- The details are a dialog named after the agent; its close button, the steering buttons and the message field are reachable by Tab
- The project switcher is a button with a listbox; the current project is marked as selected
- A polite live region reads each handoff and each steering action – "Lead handed to Coder: Guard empty carts", "Paused Coder"
- Focus rings show for the keyboard only, in light and dark; the message field firms its edge instead of a ring

### Motion

- A handoff runs as a short light along the connectors in the parent's color, hop by hop – clear in the middle, fading to nothing at both ends
- The card it reaches lights up with a Gradient Floor in its agent's color: full at the edge the light came in by, rising across the card while it fades
- Working agents' pixel marks twinkle in a wave and their line shimmers; context bars fill smoothly
- A new project's cards rise in and its connectors draw themselves; the details pop in under the card, or above it where the crew ends
- Reduced motion turns it all off – handoffs only update the cards

### Responsive

- Every agent is a white card on a soft gray tray, like the rest of the library – its tools and last handoff sit on the tray below the card
- Wide: sub-agents side by side under the lead; narrow: every level indented, the cards as wide as there's room
- Rows are fixed, so a changing activity or context never moves a card or a connector
- The details float in the top layer, as wide as their card – they never push the page or get cut off, stay inside the crew where they fit and follow the card on scroll
- Long names, activities, tasks and messages end in … with the full text on hover
- More than four tools show three tiles and "+N"; a long sender in the last handoff gives way to the message
- Broken numbers from an API hold: a context of NaN, below 0 or above 1 is kept in 0–100%, a NaN cost is left out, a start in the future reads 0s, and times past a day read "3d 0h"
- Touch screens get bigger buttons, close button and project rows to tap; on phones the switcher's list uses the width there is
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every agent and handoff a stable id – handoffs run once per id
- Keep activity short and in the present – "Editing cart.ts"
- Three sub-agents fit side by side in 760px; more switch to the indented layout
- Each sub-agent takes the next color of the palette and its helpers keep it – the connectors from it, its light and its Gradient Floor use that color; the lead is --ui-acr-blue, the rest of the colors are --ui-acr-* variables on the root
- onSteer only reports what was asked – change the agent's status in your data (e.g. to "paused") and pass the new root

### Requirements

- React 19

Related: agent-tree, agent-trail, agent-steering, collaboration-stream

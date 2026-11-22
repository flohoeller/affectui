# Agent Overlap Map, clean style (Pro)

Where the work of people's AI agents collides – every agent a small chip with its own pixel mark and whose agent it is, every open conflict a colored badge in the middle with a curve running in from each agent it involves. Red needs a decision, amber is a heads-up, grey dashed is minor. Point at a conflict or an agent and what belongs to it stays while the rest fades back; click one and a card opens with who and what it's tangled up in; whoever collides with no one is listed as in sync

- Page: https://www.affectui.com/components/agent-overlap-map
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-overlap-map-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-overlap-map-clean`

### When to use

- Showing where the AI agents of several people collide – the same files, contradicting changes, the same work done twice
- A team or workspace overview that says at a glance what needs a decision now and what is only a heads-up
- Letting people open one conflict or one agent and see everything it's tangled up in

### When not to use

- Several people or agents editing one document live – use Agent Cursors
- One agent handing work over to another – use Agent Handoff
- Every agent's status in a fleet, without the conflicts between them – use Agent Fleet

### Usage

```tsx
import { AgentOverlapMap, type OverlapConflict, type OverlapPerson } from "@/components/ui/agent-overlap-map-clean";

const people: OverlapPerson[] = [
  { id: "priya", name: "Priya Nair", note: "Pricing page and plan limits" },
  { id: "lena", name: "Lena Vogel", note: "Billing emails" },
  { id: "jonas", name: "Jonas Weber", note: "Onboarding flow" },
];

const conflicts: OverlapConflict[] = [
  {
    id: "c1",
    label: "Contradicts",
    title: "Priya’s agent raises the Pro limit to 50 seats while Lena’s keeps 25 in the emails",
    severity: "high",
    sides: [
      { personId: "priya", agentName: "Claude Code", harness: "claude-code" },
      { personId: "lena", agentName: "Codex", harness: "codex" },
    ],
  },
];

const harnesses = {
  "claude-code": { name: "Claude Code", logo: <ClaudeLogo /> },
  codex: { name: "Codex", logo: <OpenAILogo /> },
};

export function Overlaps() {
  return <AgentOverlapMap people={people} conflicts={conflicts} harnesses={harnesses} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| people | `OverlapPerson[]` |  | Everyone on the team – { id, name, note? }; the note is what they work on, shown in their agent's card. People in no conflict are listed as in sync |
| conflicts | `OverlapConflict[]` |  | The open conflicts – { id, label, title, severity, sides }; label is the short badge, title the full sentence |
| severity | `"high" \| "medium" \| "low"` |  | Red needs a decision, amber is a heads-up, a grey dashed curve is minor |
| sides | `{ personId, agentName, harness? }[]` |  | Whose agent is involved – each person and agent name becomes one agent on the map, so someone working with two agents shows twice |
| harnesses | `Record<string, { name?, logo? }>` |  | The company logo per harness key, shown before the agent's name – an agent without one shows just its name |
| selectedConflictId | `string \| null` |  | The conflict whose card is open – leave out to let the map keep its own |
| selectedPersonId | `string \| null` |  | The person whose agent card is open – leave out to let the map keep its own |
| highlightedConflictId | `string \| null` |  | The conflict pointed at – its curves come up to full color while the rest fades back |
| onSelectConflict / onSelectPerson / onHighlightConflict | `(id: string \| null) => void` |  | Called when a card opens or closes, and as the pointer or focus moves over conflicts |
| height | `number` |  | Smallest height of the map in px – it grows with the number of agents and conflicts |
| title | `string` |  | The heading – "Agent overlaps" – and the section's accessible name |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Accessibility

- Every agent and every conflict is a button with aria-expanded – Enter or Space opens its card
- An agent's name reads as "Priya Nair’s Claude Code, 3 overlaps", a conflict's as its label and full sentence
- Esc closes the card and puts focus back on what opened it; a click anywhere else closes it too
- Focus lights a conflict the same way pointing does
- The curves and the pixel marks are decoration and hidden from screen readers
- Severity is never color alone – every badge has its word, the legend and the card spell it out
- A focus ring shows only for the keyboard

### Motion

- On first view the curves draw in from the agents to the badges, the badges settle in one after another
- Pointing at a conflict or an agent brings its curves up to full color while everything else fades back – no size change
- The marks of the agents involved twinkle in a diagonal wave; what needs a decision breathes softly
- The card fades in with a small drop
- Reduced motion turns all of it off – the states simply switch

### Responsive

- Fills its container's width – agents on the left and the right, the badges in the middle
- Below 560px all agents move to the left and the badges line up on the right edge; each agent shows its person and its logo, the agent's name is in its card
- The map grows with the number of agents and conflicts, and is sorted so the curves cross as little as possible
- Long names, agent names and labels end in …; the full text is in the card
- A card opens below what you clicked if it fits, otherwise above – and never leaves the map's width; long labels in it end in …
- First names are the first word with a letter in it – "🦊 Kit Fox" shows as Kit; Arabic, Japanese and other scripts read in their own direction
- Sides naming someone who isn't in people are left out, the same agent twice in one conflict counts once, and a conflict with nobody left isn't shown
- No conflicts at all reads No overlaps right now – everyone’s agents are in sync, without the legend
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep labels to one or two words – Contradicts, Same files, Same work, Out of sync – and put the detail in title
- Use high only for what someone has to decide now; most overlaps are medium or low
- Use the same agentName for the same agent of a person across conflicts, or it shows twice
- Pass a logo per harness so people see which company's model each agent runs on

### Requirements

- React 19

Related: agent-cursors, collaboration-stream, agent-handoff, agent-fleet

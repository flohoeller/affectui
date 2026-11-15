# Memory Graph, clean style (Pro)

An agent in the middle with what it remembers and the tools it can reach in a ring around it – every memory a card with the file, chat or email it came from and that app's logo, every tool with what it may do and where, joined by Agent Tree's rounded connectors; a light runs out to each tool it uses and in from a tool through the agent to what it learns, lighting the card up with a Gradient Floor; switch anything off, forget a memory, or click the agent to drop in a file or connect a tool

- Page: https://www.affectui.com/components/memory-graph
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/memory-graph-clean.json` (needs the Pro access key)
- Import: `@/components/ui/memory-graph-clean`

### When to use

- Showing what an assistant or agent knows about the user and their work, and where each piece came from – the file, the chat, the email
- Showing which tools an agent can reach, what it may do with them, and which one it uses right now
- Letting people manage that: switch a memory or a tool off, forget a memory, drop in a file or connect a tool

### When not to use

- A flat, editable list of memories with categories and undo – use Memory Panel
- What fills one run's context window – use Context Map
- Every tool an agent touched in one run, with its calls – use Tool Access Map

### Usage

```tsx
import { MemoryGraph, type Memory, type MemoryTool } from "@/components/ui/memory-graph-clean";

const memories: Memory[] = [
  { id: "m1", text: "Prefers short answers", source: "You asked for it twice", artifact: { name: "Feedback", kind: "chat" } },
  { id: "m2", text: "Q4 design budget €48k", source: "From the budget sheet", artifact: { name: "budget-q4.xlsx" } },
  { id: "m3", text: "Redesign ships Dec 11", source: "Lea moved it in today's standup", artifact: { name: "standup-nov-14.md" }, via: "notion" },
];

const tools: MemoryTool[] = [
  { id: "notion", name: "Notion", logo: <NotionLogo />, access: "Read", scope: "Design wiki", note: "Read the standup notes" },
  { id: "github", name: "GitHub", logo: <GitHubLogo />, access: "Read & write", scope: "lumen/web" },
];

export function Memory() {
  return <MemoryGraph title="What Assistant knows" agent={{ id: "assistant", name: "Assistant", subtitle: "Personal assistant" }} memories={memories} tools={tools} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agent | `{ id, name, subtitle?, logo? }` |  | The agent in the middle – its pixel mark (twinkling while it works), its name and a short subtitle that gives way to what it does: "Using GitHub", "Learning…", "Recalling 2 memories" |
| memories | `Memory[]` |  | On the left half of the ring – six spots, filled from the middle out; once full, the last spot holds "+N more" with the rest behind it |
| Memory.text / source / tag | `string / string / string` |  | What it remembers, a line on where it came from, and what kind it is (in its details) |
| Memory.artifact | `{ name, kind?, logo?, href? }` |  | What it came from – shown with its app's logo; href adds Open to its details |
| Memory.via | `string` |  | The tool it was learned through – a new memory's light runs in from that tool |
| Memory.replaces / outdated | `string / boolean` |  | A memory that replaces another marks that one outdated – it stays, quieter, and the two link up |
| Memory.related | `string[]` |  | Memories it belongs with – pointing at one draws lines to them around the outside |
| Memory.learned / uses / disabled | `number / number / boolean` |  | When it was learned and how often it was used (in its details); disabled starts it switched off |
| tools | `MemoryTool[]` |  | On the right half of the ring, and as logos along the bottom of the agent – the ones in use clear, the rest faded |
| MemoryTool.logo / access / scope / note | `ReactNode / string / string / string` |  | Its logo before its name, what it may do and where, and what it did last – no logo shows its first letter |
| MemoryTool.used / calls / disabled | `number / number / boolean` |  | When it was last used ("3h ago"), how often it was called, and whether it starts switched off |
| using / recalling | `string[] / string[]` |  | What the agent uses and recalls right now – each tool it starts using gets a light out to it; switched-off ones are never used |
| onToggle | `(kind, id, enabled) => void` |  | Adds a switch to every card's details – off fades the card and its line, and the agent stops using it |
| onForget | `(memory) => void` |  | Adds Forget to a memory's details |
| catalog / onAddTool / onAddFiles | `MemoryTool[] / (tool) => void / (files) => void` |  | A click on the agent opens Add: a drop area for files and the catalog's tools to connect – a new memory or tool runs a light out to its spot |
| onSelect | `(memory \| null) => void` |  | A click or Enter on a memory – its details open; null when they close |
| title | `string` |  | The header's name, with how many memories and tools |
| now / formatDate | `number / (ms) => string` |  | What "3h ago" counts from, and how learned dates read – "Nov 12" by default |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Three stops: the memories, the agent, the tools
- ↑ / ↓: Walk a side top to bottom
- Home / End: The first, the last card on a side
- ← / →: Cross from a side to the agent and on to the other side
- Enter / Space: Open a card's details, or Add on the agent
- Esc: Close the details or Add – focus goes back to the card

### Accessibility

- Memories, tools and "+N more" are lists of buttons, each named with what it is, where it came from and whether it's outdated, switched off, recalled or in use
- Details and Add are dialogs named after what they belong to; the switches are real switches with their state
- A polite live region reads what the agent learns, which tools it starts using and what gets connected
- Focus rings show for the keyboard only, in light and dark
- Color never carries meaning alone: outdated, off and in use are also said in words

### Motion

- A light runs along the connectors – out to a tool the agent starts using, in from a tool through the agent to what it learns – clear in the middle, fading at both ends
- The card it reaches lights up with the Gradient Floor, rising from the edge the light came in by; a new memory or tool rises in as it arrives
- Recalled memories and tools in use tint blue and their lines shimmer; the agent's mark twinkles and its status line shimmers
- Add opens as a small card under the agent and glides into the panel
- Reduced motion turns it all off – things simply appear

### Responsive

- Every card has its own spot on the ring and every line its own point on the agent – a new memory never moves another
- Six spots a side; once full, the last spot holds "+N more" with the rest behind it, so the ring never rebuilds
- Below 640px everything stacks under the agent – memories, then tools – each hanging off its left edge
- Long names, sources, file names and scopes end in … with the full text on hover and in the details
- Broken data holds: a learned date or count that isn't a number is left out, a tool without a logo shows its first letter, a via to a missing tool runs from the agent instead
- Touch screens get bigger close buttons, switches and Add rows
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every memory and tool a stable id – lights run once per new id
- Keep text short and in the present – "Prefers short answers" – and put where it came from in source
- Name artifacts by their real file names so the right app logo shows; set kind for chats, emails and links
- Set via when a memory came through a tool – its light then runs in from that tool
- onToggle, onForget, onAddTool and onAddFiles only report – update your data and pass it back

### Requirements

- React 19

Related: memory-panel, context-map, tool-access-map, agent-crew

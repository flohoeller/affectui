# Context Map, clean style (Pro)

What fills an agent's context window, as a living treemap – system prompt, tools, memory, every file, the chat and tool results as tiles that glide as it grows, the free space dashed, and compaction squeezing old turns into a summary

- Page: https://www.affectui.com/components/context-map
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/context-map-clean.json` (needs the Pro access key)
- Import: `@/components/ui/context-map-clean`

### When to use

- Showing what fills an agent's context window – and why it's running out
- Debugging long sessions: which files, turns or tool results take the room
- Making compaction visible – old turns squeezing into a summary

### When not to use

- Just a fill level – use Context Window or Usage Meter
- Where the time and money of a run go – use Trace Waterfall
- What the agent remembers across sessions – use Memory Panel

### Usage

```tsx
import { ContextMap, type ContextBlock } from "@/components/ui/context-map-clean";

const blocks: ContextBlock[] = [
  { id: "system", label: "System prompt", kind: "system", tokens: 6200 },
  { id: "tools", label: "Tool definitions", kind: "tools", tokens: 14800 },
  { id: "spec", label: "checkout.spec.ts", kind: "file", tokens: 8200, detail: "Read at 0:09" },
  { id: "chat", label: "Chat", kind: "chat", tokens: 41000 },
  { id: "run", label: "Test run · 20×", kind: "result", tokens: 22400 },
];

export function Context() {
  return <ContextMap blocks={blocks} limit={200000} model="Opus 5.5" modelIcon={<ClaudeLogo />} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| blocks | `ContextBlock[]` |  | { id, label, kind, tokens, detail?, icon?, items? } – every part of the context, in the order the tiles should sit; items (label + icon) are listed on hover |
| kind | `"system" \| "tools" \| "memory" \| "file" \| "chat" \| "result" \| "summary"` |  | Per block – picks its tint |
| limit | `number` |  | The context window's size in tokens – what's left shows as dashed free space |
| model / modelIcon | `string / ReactNode` |  | The model and its maker's logo, next to the title – the window's size follows as a small tag |
| agents / agent / onAgentChange | `ContextAgent[] / string / (id) => void` |  | Agents to switch between – the bar shows the current one as a menu, its limit replaces limit |
| compaction | `ContextCompaction \| null` |  | { before, summarized?, dropped?, summary? } – the blocks just before the last compaction and which of them were summarized or dropped (the rest were kept); adds Before | After to the bar and a line under the map. null shows that line as "not compacted yet", so the height stays put |
| view / onViewChange | `"before" \| "after" / (view) => void` |  | Controlled: which side of the compaction shows – leave it out and the switch keeps its own |
| status | `string` |  | A short status in the bar – e.g. "Compacting" |
| onSelect | `(block \| null) => void` |  | A tile was clicked – null for the free space |
| title | `string` | `"Context"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Accessibility

- The map is a list labelled with its title; every tile is an item with its name, kind and tokens
- The fill level is text in the bar – its color is extra, not the only signal

### Motion

- A tile's card shows while you point at it; a click pins it – a second click, Escape or the block leaving the map lets it go
- Text that changes after a compaction rolls: the old line slides up and out, the new one comes in from below
- Before | After glides between the two maps: kept blocks stay, summarized and dropped ones grow back in while the summary shrinks away – and back
- Tiles keep their order and glide to their new place and size when anything changes
- New parts fade in where the layout puts them; parts that leave shrink to nothing
- A shine sweeps over the used token count all the time
- With prefers-reduced-motion tiles jump to their place

### Responsive

- The area keeps its height; tiles too small for a label show only their color – point at them for the details
- Under 480px the area is shorter and the numbers move to a line of their own
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass every part every time something changes – ids keep tiles in place and let them glide
- Order matters: the layout keeps it, so put stable parts (system, tools) first and growing ones later
- To show compaction, shrink the squeezed parts to 0 over a moment while a summary block grows
- Colors are variables on .ui-cmpc, e.g. --ui-cmpc-file-bg / --ui-cmpc-file-edge

### Requirements

- React 19

Related: context-window, memory-panel, usage-meter, trace-waterfall

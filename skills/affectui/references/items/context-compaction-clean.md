# Context Compaction, clean style (Pro)

An agent's context window filling up and being compacted – a bar of slices as wide as their tokens, folding into one summary row, or by hand with Compact now

- Page: https://www.affectui.com/components/context-compaction
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/context-compaction-clean.json` (needs the Pro access key)
- Import: `@/components/ui/context-compaction-clean`

### When to use

- Showing what fills an agent's context during a long run – and what happens when it compacts
- Making auto-compaction visible: which entries went into the summary and how much it saved
- A side panel next to an agent chat or a coding agent's log

### When not to use

- What fills the context by category, with files and tools to remove – use Context Window
- How a run's tokens and cost add up step by step – use Cost Waterfall
- What an agent remembers across runs – use Memory Panel

### Usage

```tsx
import { ContextCompaction, type ContextEntry } from "@/components/ui/context-compaction-clean";

const entries: ContextEntry[] = [
  { id: "sys", kind: "system", label: "System prompt", tokens: 3200 },
  { id: "tools", kind: "tools", label: "14 tool definitions", tokens: 9800 },
  { id: "u1", kind: "user", label: "The cart total is off by a cent", tokens: 400 },
  { id: "f1", kind: "file", label: "src/cart/cart.ts", tokens: 18400 },
  { id: "t1", kind: "tool", label: "run_tests · 48 tests", tokens: 26300 },
];

export function Context() {
  return <ContextCompaction title="Fix the cart total" model="Claude Sonnet" entries={entries} limit={200_000} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| entries | `ContextEntry[]` |  | What sits in the window, in order – { id, kind, label, tokens, replaces?, before?, count?, apps?, total? }. kind is system, tools, user, assistant, tool, file or summary. apps – { name, path?, icon?, color?, tile? } – shows up to three overlapping logo tiles and +N for the rest of total; path is a one-color logo on a 24 grid, icon any node (a multi-color logo, a glyph) |
| limit | `number` |  | The window's size in tokens |
| threshold | `number` |  | Share of the limit where it compacts on its own – the dashed mark; from there the percentage turns amber. Default 0.8 |
| compacting | `string[]` |  | Ids of the entries being compacted right now – they shimmer, and the bar says Compacting |
| title | `string` |  | The name in the bar – default Context |
| model | `string` |  | A small tag beside the title, e.g. the model |
| onCompact | `() => void` |  | Shows the last row with the colors and a Compact now button |
| rows | `number` |  | Rows the list shows before it scrolls – default 7 |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-cpxc-k-file |

### Keyboard

- Tab: One stop for the list, then Compact now
- ↑ / ↓: The entry before or after – its slice lights up, a summary or a row with apps shows its card
- Enter / Space: Keeps a row's card open; Esc closes it
- Home / End: The first or the newest entry
- Space / Enter: Compact now, on the button

### Accessibility

- The bar is a meter – "148K of 200K tokens"
- Every entry reads its kind, what it is and its tokens – a summary also what it was before
- When a summary has folded its entries, a polite live region says how many and from how much to how much
- A row with apps or a summary opens a card on hover, focus or click – every app it brings in, or the entries the summary holds with their sizes
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- A new entry slides in at the bottom and its slice grows in the bar
- Entries being compacted shimmer, in the list and in the bar
- Folding: the rows slide up into the summary and fade, their slices squeeze together and shrink to its size, the numbers follow – worked out from the clock, so it stays right whatever the frame rate
- With prefers-reduced-motion nothing moves – the summary simply takes their place

### Responsive

- The bar and the rows fit the width; labels shorten with an ellipsis
- Narrow: the colors in the last row and the before-numbers on summaries go
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep ids stable – a summary only folds entries whose ids it lists in replaces and that were on screen before it
- Put the summary where the first replaced entry was, so the rows fold upward into it
- System prompt and tool definitions usually stay – leave them out of replaces

### Requirements

- React 19

Related: context-window, cost-waterfall, memory-panel, agent-timing

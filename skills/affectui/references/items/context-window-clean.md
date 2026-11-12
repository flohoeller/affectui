# Context Window, clean style (Pro)

What fills the model's context, as a field of cells – hover a part to light it up, remove files, and compact the conversation while its cells shimmer and clear

- Page: https://www.affectui.com/components/context-window
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/context-window-clean.json` (needs the Pro access key)
- Import: `@/components/ui/context-window-clean`

### When to use

- Chat and agent products where people should see what the model currently has in mind – and why answers get slow, expensive or forgetful
- Next to a composer or in a session panel, to clean up before the window is full: drop files, compact the conversation
- Debug and admin views that explain a request: how much went to the system prompt, tools, files and history

### When not to use

- Billing and plan usage over a month – use Usage Meter
- A plain "72% used" – a single progress bar says that with less
- More than about six parts – group the small ones, the cells need colors people can tell apart

### Usage

```tsx
import { ContextWindow } from "@/components/ui/context-window-clean";

export function SessionContext() {
  return (
    <ContextWindow
      limit={200_000}
      model="claude-sonnet-5-5"
      parts={[
        { id: "system", label: "System prompt", tokens: 4200, locked: true },
        { id: "tools", label: "Tools", tokens: 12800 },
        {
          id: "files",
          label: "Files",
          items: [
            { id: "schema", label: "schema.prisma", tokens: 9400 },
            { id: "billing", label: "billing.ts", tokens: 21300 },
          ],
        },
        { id: "chat", label: "Conversation", tokens: 108600, compact: true },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| parts | `ContextPart[]` |  | { id, label, tokens?, items?, locked?, compact?, color? } – they fill the field in this order |
| limit | `number` |  | Size of the context window in tokens |
| title | `string` | `"Context window"` | Heading of the card |
| model | `string` |  | Small tag in the head, e.g. the model name |
| modelIcon | `ReactNode` |  | Logo in front of the model name, shown at 12px |
| onRemoveItem | `(partId: string, itemId: string) => void` |  | Called when an item is removed. With it the card shows exactly what you pass; without it the removal lives inside the card |
| onCompact | `(partId: string) => void \| Promise<void>` |  | Called when Compact is pressed; the cells shimmer until the promise settles. Without it the part shrinks on its own to its compact share |
| action | `{ label: string; onClick: () => void }` |  | A secondary button in the card's last row, e.g. New chat |
| warnAt | `number` | `0.8` | Share of the limit from which the percentage tag turns amber and the last row says how much is left; from 0.95 the window counts as full |
| cells | `number` | `216` | Number of cells in the field |
| columns | `number` | `36` | Cells per row |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the parts that can be opened, the Compact button, the items' remove buttons and the action
- Enter / Space: Opens or closes a part with items, presses Compact or removes an item

### Accessibility

- A group named by its title; the rolling number is aria-hidden and screen readers get the final "used of limit" in one sentence
- The field of cells is decorative – every number it shows is in the list below
- Parts with items are buttons with aria-expanded; closed lists are inert, remove buttons are named after their item
- The caption in the last row is announced politely: compacting, how much was saved, and how much is left once the window fills up

### Motion

- Any change sweeps through the field cell by cell, so removing a file empties its cells from left to right and everything behind it moves up
- Compacting makes the part's cells shimmer in a lighter wave while the caption shimmers "Compacting…"; then most of them clear, the numbers roll down and the button morphs into a green check on a light green fill with "Compacted" for a moment and then fades away – it only comes back once the part has grown again
- Hovering a part (row or cells) fades the other cells and rolls the big number to that part
- Items unfold in place; a removed item folds away before it goes
- With prefers-reduced-motion everything switches without movement

### Responsive

- Fills its container up to 360px. Below 310px the field puts fewer cells in a row so they stay readable, the model tag shortens and Compact keeps only its icon
- Touch screens: taller rows and buttons
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- A part with items takes its tokens from the items' sum – leave tokens out there
- One cell stands for limit / cells tokens; any part with tokens gets at least one cell so it never disappears
- The card does not count tokens – pass the numbers your provider or tokenizer returns

### Requirements

- React 19

Related: usage-meter, tool-call-card, chat-composer

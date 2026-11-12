# Memory Panel, clean style (Pro)

What the assistant remembers about you, grouped and editable – a master switch, category filters, and on every memory edit in place, pause or forget with Undo on the tray

- Page: https://www.affectui.com/components/memory-panel
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/memory-panel-clean.json` (needs the Pro access key)
- Import: `@/components/ui/memory-panel-clean`

### When to use

- Assistants and agents that remember things across chats – the place where people see, correct and remove what was kept
- Settings or a side panel next to the chat, so a wrong memory can be fixed the moment it shows up in an answer
- Products that need a clear off switch for personalization without losing what was saved

### When not to use

- What the model has in mind right now, inside one conversation – use Context Window
- Hundreds of entries with sorting and bulk actions – a Data Table handles that better
- Account settings that are not about what the assistant learned – a plain settings list says that with less

### Usage

```tsx
import { MemoryPanel } from "@/components/ui/memory-panel-clean";

export function AssistantMemory() {
  return (
    <MemoryPanel
      memories={[
        { id: "ts", text: "Prefers TypeScript examples over plain JavaScript", category: "Preferences", source: "From chat", date: "Oct 12" },
        { id: "role", text: "Product designer and front-end developer", category: "Work", source: "From chat", date: "Sep 28" },
        { id: "fintech", text: "Redesigning a fintech onboarding flow, due Oct 24", category: "Projects", source: "From chat", date: "Oct 11" },
      ]}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| memories | `Memory[]` |  | { id, text, category, source?, date?, paused? } – source and date are shown as given, e.g. "From chat" and "Oct 12" |
| onChange | `(memories: Memory[]) => void` |  | Called with the full list after any change. With it the panel shows exactly the memories you pass; without it the changes live inside the panel |
| onAdd | `(memory: Memory) => void` |  | A memory was added with New memory |
| onEdit | `(id: string, text: string) => void` |  | The text of a memory was edited and saved |
| onPause | `(id: string, paused: boolean) => void` |  | A memory was paused or resumed |
| onForget | `(id: string) => void` |  | A memory was forgotten – it can still come back with Undo |
| onRestore | `(memory: Memory) => void` |  | A forgotten memory was brought back with Undo, at its old place |
| enabled | `boolean` |  | The Use memory switch, controlled |
| defaultEnabled | `boolean` | `true` | Start state of the switch when it is not controlled |
| onEnabledChange | `(enabled: boolean) => void` |  | Called when the switch is flipped |
| categories | `string[]` |  | Order of the groups and the choices for new memories – defaults to the categories in the order they appear |
| title | `string` | `"Memory"` | Heading of the panel |
| maxHeight | `number` | `360` | Height of the list in px before it scrolls |
| undoFor | `number` | `5000` | How long Undo stays in the last row after forgetting, in ms |
| addedSource | `string` | `"You added"` | Source given to memories added in the panel; their date is today |
| action | `{ label: string; onClick: () => void }` |  | A button in the last row of the card – Undo takes its place for a moment after forgetting |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Switch, the selected category chip, search, then each memory's Edit, Pause and Forget, New memory and the last-row button
- ← / →: Move between category chips (and between categories of a new memory)
- Enter: Saves an edited or new memory (Shift + Enter for a line break)
- Esc: Cancels editing, closes New memory or the search field

### Accessibility

- A group named by its title; Use memory is a switch with aria-checked and controls the note that unfolds
- Category chips are a radiogroup with arrow keys and one tab stop; each group of memories is a labelled section
- Every action button is named after its memory, e.g. "Forget “Prefers TypeScript…”"; actions also show on keyboard focus
- Rows that are filtered out or folding away are inert, so the keyboard never lands on something hidden
- The status line in the last row is announced politely: counts, the forgotten memory with Undo, and editing hints

### Motion

- Filtering folds the rows that don't match closed and fades them – nothing slides across the list
- Forgetting folds the row away with a soft blur; Undo unfolds it at its old place and scrolls it into view
- Pausing greys the text and a Paused tag fades in; the pause icon swaps to play
- Counts on the head and in the last row roll to their new value; changing status text crossfades
- Turning memory off dims the list and unfolds a short note; New memory unfolds into the editor in place of the button
- With prefers-reduced-motion everything switches without movement

### Responsive

- Fills its container up to 400px; works from 300px wide. Below 360px the chips drop their counts, below 320px the switch keeps only its track
- Category chips scroll sideways when they don't fit, with a soft fade at the edge while more hide past it
- Touch screens: the actions are always visible and every button gets a taller hit area
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass source and date already formatted – the panel shows them as they are
- Forgetting calls onForget right after the row folds away; keep the item around (soft delete) until undoFor has passed if your backend can't restore it
- Paused memories stay in the list and count in the total; filter them out yourself before sending memories to the model
- Without onChange the panel copies memories once on mount – give it a new key to reset it

### Requirements

- React 19

Related: context-window, chat-composer, integration-settings, filter-menu

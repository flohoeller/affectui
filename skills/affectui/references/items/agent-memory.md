# Agent / Memory (Pro)

What your agent knows about you and your work – grouped by where it applies, each with where it came from and where it was used; a memory it recalls lights up while it works, and what it picks up on its own waits for your OK

- Page: https://www.affectui.com/screens/agent-memory
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-memory.json` (needs the Pro access key)
- Import: `@/components/ui/agent-memory`

### When to use

- Showing what an agent remembers about a person and their work – and letting them correct it, move it to a project or forget it
- Making memory visible while the agent works: which memory it just used, how often, and for what
- Asking for consent before the agent keeps something it picked up on its own

### When not to use

- Instructions that apply to every chat (a system prompt) – use Settings / Preferences
- Files and sources the agent can read – use Folders
- What waits on a decision – use Agent / Inbox

### Usage

```tsx
import { AgentMemoryScreen } from "@/components/ui/agent-memory";

export default function Page() {
  const [memories, setMemories] = useState(initialMemories);
  return (
    <AgentMemoryScreen
      memories={memories} // a newer usedAt plays the recall sheen on that row
      projects={["Northwind", "Platform", "Evalkit"]}
      onChange={(m) => api.updateMemory(m)}
      onForget={(id) => api.forget(id)}
      onRestore={(m, at) => api.restore(m)}
      onKeep={(id) => api.keep(id)}
      onCreate={(m) => api.remember(m.text, m.project)}
      onOpenSource={(m) => router.push(sourceUrl(m))}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| memories | `{ id; text; project?; source: { kind: "thread" \| "decision" \| "told" \| "file"; at; quote?; question?; file? }; uses?; usedAt?; usedIn?: { task; how; at }[]; review? }[]` |  | Every memory. Without a project it lists under About you and applies everywhere; source is where it came from – your words go in quote, a decision's question in question, a file's name in file; usedIn is where it was used, newest first; review lists it under To review until Keep. Pass a stable array (state): the screen follows it, and when a memory's usedAt moves on, its row lights up |
| projects | `string[]` | `in the order they appear` | The projects, in the order their groups show – and the choices for Applies to |
| defaultTab | `"saved" \| "review"` | `"saved"` | The list the screen opens with |
| defaultSelected | `string \| null` | `"friday"` | The memory open on the right when the screen starts |
| inboxCount | `number` | `5` | The Inbox count in the sidebar |
| onSelect | `(id: string) => void` |  | Called when a memory is opened |
| onCreate | `(memory: AgentMemory) => void` |  | Called with a memory you added with Remember – source told, at the top of its group |
| onChange | `(memory: AgentMemory) => void` |  | Called with the whole memory when you edit its words or where it applies – and when Undo takes a Keep back (review: true) |
| onForget | `(id: string) => void` |  | Called once a forgotten (or not kept) memory's row has folded away |
| onRestore | `(memory: AgentMemory, index: number) => void` |  | Called when Undo brings it back – index is where it was in the list |
| onKeep | `(id: string) => void` |  | Called with Keep on a memory under To review |
| onOpenSource | `(memory: AgentMemory) => void` |  | Called with Open next to where it came from – without it the screen calls onNavigate("Thread") or onNavigate("Agent Inbox") for a decision |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Fieldwork"` | The workspace in the sidebar |
| labels | `{ memory?; saved?; review?; reviewShort?; aboutYou?; everywhere?; remember?; keep?; dontKeep?; forget?; undo?; … }` |  | Labels, e.g. for a translation |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your memories load: gray rows under gray group heads in the list and gray lines in the Memory panel, in the shape of the real ones (the shared Skeleton) |
| empty | `boolean` |  | No memories at all: Saved shows Nothing remembered yet with a sentence on where memories come from and a Remember button, To review shows Nothing to review, and the Memory panel shows nothing open |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K: Next and previous row – anywhere in the screen, as long as you're not typing
- ↑ / ↓ / Home / End: In the list: move through the group heads and rows (one Tab stop)
- Enter / Space: On a row: open the memory on the right. On a group's head: fold or unfold it
- ← / →: On a group's head: fold, unfold (→ on an open one steps into it). On a row, ← goes to its group's head
- Delete / Backspace: On a row: forget it – or, under To review, don't keep it; Undo brings it back for five seconds
- /: Search – Esc clears it, ↓ steps into the results
- N: Remember something new – Enter saves it and clears the line for the next one, Esc closes it
- Enter / Esc: In the panel's text: Enter saves your edit, Esc puts the old words back

### Accessibility

- The list is a role="tree": group heads are level-1 items with aria-expanded and their count, rows level-2 items; one Tab stop, the arrow keys move it
- Every row is named in full – what it knows, where it came from, how often and when it was last used – while the faint columns stay hidden from screen readers
- Keep and Don't keep on a row are a pointer's shortcuts; the keyboard reaches the same through Enter, then the panel's buttons, or Delete
- A polite live region says what happened: "Forgotten: …", "Kept – it uses this from now on"
- Text fields never get a ring – the caret and a firmer edge say it; rings show for the keyboard only and sit inset in the list and the panel
- Applies to is the App Shell's menu – every item with an icon, the chosen one checked
- Long text ends in '…' with the full text in a tooltip; right-to-left text reads in its own direction and still starts at the row's glyph

### Motion

- One moment: when the agent recalls a memory, a soft sheen with a glowing leading edge runs through its row, its glyph warms for a beat, the count ticks up and the time says now
- A new memory glides in at the top of its group; a forgotten one folds away to the side
- With prefers-reduced-motion nothing sweeps or glides – the count and time simply change

### Responsive

- Fills its container – give it the full viewport height in your app
- Rows have one fixed height; source, uses and time sit in fixed columns so they line up; below 720px the source column makes room
- Below 560px each row takes two lines of text and a row opens its memory in the App Shell's sheet from the right
- Below 400px the search folds to its icon and takes the tabs' place while you type; below 340px To review says Review (labels.reviewShort)
- Counts stay in their column at any size – 12.5K× in the row, the whole number in the panel; dates from another year carry the year
- Long lists stay quick: rows are memoized, so moving through a thousand memories only re-renders the two rows that change
- Touch targets grow to 36px and shortcut hints hide on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-tasks, inbox, agent-thread

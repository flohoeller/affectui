# Agent / Inbox (Pro)

What your orchestrator needs from you, one question at a time – pick an option, a variant or approve, send it in a keystroke and the next one glides in

- Page: https://www.affectui.com/screens/inbox
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/inbox.json` (needs the Pro access key)
- Import: `@/components/ui/inbox`

### When to use

- You work with one orchestrator in one thread, and it hands you the decisions it can't make alone – a choice between options, a variant to pick, an action to approve or a question to answer
- Clearing what waits on you quickly, from the keyboard, without reading traces or agent trees

### When not to use

- Watching how a run unfolds – use Agent / Orchestration or AI Chat / Run
- A few decisions inside another page – use Decision Inbox or Approval Card

### Usage

```tsx
import { InboxScreen } from "@/components/ui/inbox";

export default function Page() {
  const [items, setItems] = useState(initialItems);
  return (
    <InboxScreen
      items={items}
      running={tasks.filter((t) => t.running).length}
      onDecide={(id, answer) => api.answer(id, answer)}
      onLater={(id) => api.snooze(id)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with "Tasks" from the empty state |
| workspace | `string` | `"Fieldwork"` | The workspace in the sidebar |
| items | `{ id; kind: "decision" \| "pick" \| "approval" \| "question"; question; context?; task; at; unread?; options?; facts?; suggestions?; done? }[]` |  | Everything the orchestrator asked. at is a timestamp in ms; options { id, title, summary?, recommended?, pros?, cons?, wireframe?, preview? } for decision and pick – the recommended one is chosen when it opens; facts { label, value } for approval; suggestions for question; done { answer, at, label? } lists it under Done. Pass a stable array (state) – the screen follows it when it changes |
| running | `number` | `3` | How many tasks keep running – the line under "You're all caught up" |
| defaultTab | `"open" \| "done"` | `"open"` | The list the screen opens with |
| defaultSelected | `string` |  | The item open when the screen starts, by id – for a deep link, e.g. a task's Decide on the Tasks screen (?item=queue); it opens in its own list, and on phones full-width |
| onDecide | `(id: string, answer: { option?: string; text?: string } \| "approve" \| "decline") => void` |  | Called when you send – with the chosen option, what you wrote in the reply field, or both; approve / decline for an approval |
| onLater | `(id: string) => void` |  | Later – the item moves to the end of the open list |
| onReopen | `(id: string) => void` |  | Reopen on a done item – it moves back to the top of the open list |
| onSelect | `(id: string \| null) => void` |  | Called when another item shows, and with null when none is left |
| tasks | `Record<string, { goal?; project?; status?; started?; steps?; artifacts? }>` |  | About each task, by its name – shown in the Task panel on the right |
| artifacts | `Record<string, { updated?; doc?; table?; sheet?; code?; image?; files?; preview? }>` |  | What each artifact shows in its tab, by file name. doc { title, paragraphs?, bullets?, html? } opens as a page you write in – bullets that start with "[ ] " / "[x] " make a checklist, html is what you wrote; table is rows of strings (a cell starting with = is a formula) with sheet { widths?, styles? } for column widths and cell styles by "row:col" ({ bold?, format?: "general" | "number" | "percent" | "currency" }); files is a folder – names, or { name, size?, modified?, kind?, files? } with size in bytes and modified as an ISO date or timestamp; a name without an extension is a subfolder |
| defaultOpenArtifacts | `{ task: string; name: string }[]` |  | Artifacts already open as tabs in the Task panel when the screen starts – once every tab was closed, the panel comes back with the task alone |
| suggested | `WorkspaceSource[]` | `a few of the artifacts` | Suggested in a New tab of the Task panel (the + after its tabs) – one with an artifact opens it in that tab |
| onOpenArtifact | `(task: string, name: string) => void` |  | Called when an artifact opens – from the Task panel, a done item or a folder |
| onArtifactChange | `(name: string, artifact: ShellArtifact) => void` |  | Called with the whole artifact whenever you change it in its tab – a cell, a column width, a style, the document's text, a folder's entries. The screen keeps every change itself while it lives (switch tabs, close and reopen); save it here |
| labels | `{ inbox?; open?; done?; send?; later?; approve?; decline?; reopen?; recommended?; reply?; answer?; sent?; caughtUp?; tasks?; running?: (n) => string; … }` |  | Labels, e.g. for a translation |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your items load: gray rows in the list, a gray question in the reading column and gray lines in the Task panel, in the shape of the real ones (the shared Skeleton) |
| empty | `boolean` |  | No items at all: the list's head and Open / Done stay, the reading column shows “Nothing in your inbox yet” with a short line and a Go to Thread button, the Task panel says no task is open and the Inbox count hides; loading wins when both are on |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K: Next and previous item – anywhere in the screen, as long as you're not typing
- ↑ / ↓ / Home / End: In the list: move through the items (one Tab stop, the selected row takes it); the item shows on the right as you go
- 1 / 2 / 3: Pick that option or variant; in the options themselves ↑ ↓ ← → move between them
- Enter: Send – from anywhere, from the reply field too; on an option, picks it and sends. An approval is approved (or your words are sent instead)
- L: Later – the item moves to the end of the list and the next one shows
- R / /: Focus the reply field (on a question: the answer field)
- Shift Enter: A new line in a question's answer
- Esc: Leave the reply field – on phones, go back from the item to the list
- ← →: Open / Done: switch between the two lists
- ← → / Home / End: Task panel tabs: move between them; Delete closes the focused tab – the task too; closing the last one folds the panel and the focus moves to its open button
- ↑ ↓ ← → / Shift + arrows / ⌘ + arrows: Sheet: move the active cell, extend the selection, jump to the edge of the data
- Tab / Shift Tab / Enter / Shift Enter: Sheet: move right / left / down / up like Excel; Tab at the last column (Shift Tab at A) leaves the sheet
- Type / F2 / Enter / Esc: Sheet: typing replaces the cell (arrows then write it and move on), F2 or a double-click edits in place, Enter or Tab writes, Esc cancels; = starts a formula and a click on a cell adds its name
- ⌘A / ⌘C / ⌘X / ⌘V / ⌘Z / ⇧⌘Z / ⌘B / Delete: Sheet: select all, copy / cut / paste as tab-separated text, undo, redo, bold, clear the selection
- ⌘B / ⌘I / ⌘U / ⇧⌘X / ⌘E / ⌘K: Document: bold, italic, underline, strikethrough, inline code, link
- ⇧⌘7 / ⇧⌘8 / ⇧⌘9 / ⌘Enter / Tab: Document: numbered, bulleted and checklist; ⌘Enter ticks a checklist item; Tab / Shift Tab nest a list item. Typing "# ", "## ", "- ", "1. ", "[ ] " or "> " at the start of a line formats it
- ↑ ↓ / Shift ↑ ↓ / ⌘A / Enter / Space: Folder: move, extend, select all, open (a file in its own tab, a folder in place), Quick Look; type a name's start to jump to it
- ⌘[ / ⌘] / ⌘↑ / F2 / ⌘D / ⌘⌫ / ⇧⌘N / ⌘1 / ⌘2 / ⌘F: Folder: back, forward, up, rename, duplicate, move to trash, new folder, list / icons, search
- Shift F10 / Context menu key: Opens the context menu on the active cell, the caret or the selected item; ↑ ↓ move, → opens a submenu, ← and Esc go back

### Accessibility

- The list is a listbox with a roving tabindex – one Tab stop; every row is named in full: its kind, the question, the task, when it came in and whether it's unread
- Options and variants are radio groups – the chosen one is checked, its pros and cons are read with it and hidden from the others
- After you send, the focus stays on the item's heading while it confirms, then moves to the next item's heading – or to "You're all caught up"; Later and Reopen move it the same way, so it's never dropped
- A polite live region says what happened: "Sent. 4 left.", "Later. Next: …", "Reopened. 5 open."
- Shortcuts are listed on their buttons (aria-keyshortcuts) and never fire while you type, apart from Enter and Esc
- Every control shows the accent focus ring for the keyboard only (:focus-visible) – inside rows and option cards it sits inset, so a scroller never cuts it
- Long questions, tasks and options end in '…' with the full text in a tooltip; right-to-left text reads in its own direction
- The artifact toolbars are role="toolbar" with one Tab stop – ← → Home End move between the 28px tools; every tool has a name and a tip with its shortcut, toggles are aria-pressed
- The sheet is a role="grid" with aria-activedescendant on the active cell and aria-selected on every selected one; the active cell's ring turns accent while the sheet has the focus; changes, sorts and formula results are announced in a polite live region
- The document is a multi-line textbox; the folder a multi-select listbox with the keyboard's place shown as an inset accent ring; Quick Look is a dialog that leaves the focus in the list
- Menus, the link field and Quick Look close with Esc and hand the focus back; context menus are role="menu" with menuitem / menuitemcheckbox items, disabled ones marked aria-disabled
- The Task panel is the App Shell's work area: a tablist whose every tab – the task included – has a labelled ×; + opens a New tab with Suggested artifacts; the viewers, toolbars and menus are the App Shell's
- No shortcut fires while you type in a field, and the work area never scrolls sideways – only the sheet does, inside itself

### Motion

- One moment: sending turns the answer into a check that draws itself and "Sent – it'll take it from here", then the row folds out of the list and the next item glides in
- The chosen option opens to its pros and cons; the unread dot fades once you've seen the item
- Menus, tips and Quick Look fade in quickly; the sheet's selection moves without animation, like Excel's
- With prefers-reduced-motion nothing slides, folds or draws – the confirmation simply shows

### Responsive

- Fills its container – give it the full viewport height in your app
- Rows have one fixed height; the reading column stays at most 560px wide and centered
- Below 640px the list fills the screen; a row opens its item full-width with a back button, and Esc goes back
- On phones the reply field takes its own line above the buttons, the variants keep three to a row, shortcut hints hide; touch targets grow to 36px
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: decision-inbox, agent-inbox, approval-card

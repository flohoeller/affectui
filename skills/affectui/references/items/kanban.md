# Kanban Board (Pro)

Issues on a board by priority – drag cards between columns, switch to a list, filter and sort

- Page: https://www.affectui.com/screens/kanban
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/kanban.json` (needs the Pro access key)
- Import: `@/components/ui/kanban`

### When to use

- Issue, bug or task tracking where work moves through stages
- Any list people sort by dragging into columns

### When not to use

- Hundreds of items per column – use a table with filters
- Data people edit cell by cell – use the CRM screen

### Usage

```tsx
import { KanbanScreen } from "@/components/ui/kanban";

export default function Page() {
  return <KanbanScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: gray cards (board) or rows (list) in the shape of the real ones, under the real column heads, so nothing jumps when the data lands |
| empty | `boolean` |  | No issues yet: the bar, tabs and New task stay, the board or list gives way to one empty state – “No tasks yet”, a line on what shows up here and a New task button that opens the New issue window |
| className | `string` |  | Extra class on the root |
| columns | `{ id; label; tone: "low" \| "medium" \| "high" \| "done" }[]` |  | The columns, left to right – tone picks the priority mark |
| cards | `{ id; column; title; description?; status?: "review" \| "attention" \| "progress" \| "fixed"; comments?; attachments? }[]` |  | The issues – `column` puts each one into a column; every card shows title, detail, status and counts |

### Keyboard

- Tab: Move through the cards; Filter, Sort and the view switch are buttons
- Enter: Open the focused card or row
- ⌘ Enter: Send a comment in an open issue, or create the issue in the New issue window
- Esc: Close the New issue window

### Accessibility

- Columns are labelled sections, cards are labelled and focusable
- Board / List is a radio group; Filter and Sort are menus with checked items
- Status and priority marks are decorative – the status is written next to them
- An open issue edits its title and description in place; status, priority, assignee, labels and project are menus with checked items, and every change shows up in the activity

### Motion

- A column's + fades in while the pointer is on the column; the New issue window rises in over a soft scrim
- Columns and cards rise in one after another
- A dragged card fades in place; a blue line shows where it lands
- All motion stops with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height in your app
- The board scrolls sideways when the columns don't fit; on phones the bar wraps and list rows keep only the title and status
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell and Button (installed with it)

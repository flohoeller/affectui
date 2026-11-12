# Task Board, clean style (Pro)

Kanban board with drag and drop, quick add, a detail panel, search, label filters and a compact view

- Page: https://www.affectui.com/blocks/task-board
- Section: Blocks · Productivity
- Install: `npx shadcn@latest add https://www.affectui.com/r/task-board-clean.json` (needs the Pro access key)
- Import: `@/components/ui/task-board-clean`

### When to use

- Sprint and project boards in a product, with tasks moving through a few statuses
- Internal tools where people sort work by dragging it

### When not to use

- Thousands of tasks – each column shows 50 cards and grows with Show more; beyond that, page and filter on the server
- Touch-first apps – native drag and drop needs a mouse; offer the detail panel's status buttons instead

### Usage

```tsx
import { TaskBoard } from "@/components/ui/task-board-clean";

export function Sprint({ tasks }) {
  return (
    <TaskBoard
      tasks={tasks}
      statuses={statuses}
      labels={labels}
      people={people}
      path={["Northwind", "Launch", "Sprint 12"]}
      onChange={save}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tasks | `Task[]` |  | key, title, status, priority (0–4), estimate, labels, assignee, dueIn, subtasks, pullRequest, created |
| statuses | `TaskStatus[]` |  | Columns in order: id, label and icon |
| labels | `TaskLabel[]` |  | id, label and color – used on cards, in the filter and in the panel |
| people | `TaskPerson[]` |  | id, name and avatar for assignees |
| path | `string[]` |  | Breadcrumb above the board |
| onChange | `(tasks: Task[]) => void` |  | Called with all tasks after every move, edit, add or delete |

### Keyboard

- Tab: Move through the toolbar, columns and cards; inside the open panel, Tab stays in the panel
- Enter / Space: Open the focused card in the detail panel
- ↑ / ↓: On the filter button: open the label menu; in the menu: move between labels, Home and End jump to the ends
- ← / →: In the panel's status and priority: pick the previous or next one – this moves the card to another column without dragging
- Enter: In a new task: add it and put focus on the new card
- Escape: Close the menu or the detail panel and return focus to its button or card, or cancel a new task and return to its +

### Accessibility

- Every card is focusable and opens a dialog panel where status and priority are radio groups (one Tab stop, arrow keys) and labels and assignee are toggle buttons – no dragging needed; deleting a card moves focus to its neighbour
- The star, compact view and filter are pressed or checked toggles; the breadcrumb marks the current page
- Due dates that are close or late are tinted badges that also say "Today", "2d" or "1d late", so they never rely on color alone

### Motion

- Columns and cards rise in one after another, a thin blue line shows where a dragged card lands and its column turns a shade darker, the panel slides in from the right
- Reduced motion turns these off

### Responsive

- Columns keep a minimum width and the board scrolls sideways on narrow screens; on phones the tools move under the path; on touch screens buttons, fields and menu rows grow to 36–40px and each column's + stays visible (elsewhere it shows on hover)
- Every card has the same height: the title stays on one line and the detail on two (full title in the panel); keys, labels, column names and the breadcrumb end in an ellipsis and show in full on hover; more than three labels fold into +N; column counts above 999 read 999+
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

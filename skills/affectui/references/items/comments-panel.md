# Comments Panel (Pro)

Comment feed with filters, runnable /edit commands, resolve and a composer

- Page: https://www.affectui.com/components/comments-panel
- Section: Components · Chat
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/comments-panel.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/comments-panel-clean.json` (needs the Pro access key) – lands as `comments-panel-clean.tsx`, import from `@/components/ui/comments-panel-clean` – its docs: `comments-panel-clean.md`
- Import: `@/components/ui/comments-panel`

### When to use

- A comments sidebar next to a document, design or record
- Collaboration with an assistant that can apply edits people suggest with /edit

### When not to use

- Long discussions with nested replies – use the Comment Thread for one conversation

### Usage

```tsx
import { CommentsPanel } from "@/components/ui/comments-panel";

export function Sidebar({ comments, me }) {
  return (
    <CommentsPanel
      comments={comments}
      currentUser={me}
      onRunEdit={(c) => api.applyEdit(c.text)}
      onAdd={(c) => api.saveComment(c)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| comments | `PanelComment[]` |  | id, author ({ name, avatar }), createdAt and text – text starting with /edit becomes a runnable edit |
| currentUser | `CommentAuthor` |  | Author of new comments |
| onRunEdit | `(comment) => Promise<void> \| void` |  | Runs an edit; the button shows Running… until the promise settles |
| onAdd | `(comment) => void` |  | Called with every new comment |
| onClose | `() => void` |  | Shows a close button |
| title | `string` | `"Comments"` | Heading in the gray tray |

### Keyboard

- Tab: Move through tabs, sort, comments and the composer
- Enter: Send the comment in the composer

### Accessibility

- Filters are tabs, sorting is a menu of radio items, resolve is a toggle button
- Times are real time elements; the list announces new comments politely

### Motion

- New comments fade in, edits show a spinner, the sort menu drops in – reduced motion turns this off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: comment-thread, smart-recommendation

# Comment Thread, clean style (Free)

One comment with replies – an assistant reports what it did, folds open details and answers @mentions

- Page: https://www.affectui.com/components/comment-thread
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/comment-thread-clean.json`
- Import: `@/components/ui/comment-thread-clean`

### When to use

- A single conversation attached to a selection, a cell or a line of text
- Showing what an assistant did after someone asked for a change

### When not to use

- A feed of many comments – use the Comments Panel

### Usage

```tsx
import { AssistantMark, CommentThread } from "@/components/ui/comment-thread-clean";

const atlas = { name: "Atlas", avatar: <AssistantMark />, assistant: true };

export function Thread({ messages, me }) {
  return (
    <CommentThread
      messages={messages}
      currentUser={me}
      assistant={atlas}
      onReply={async (text) => (text.includes("@Atlas") ? await api.ask(text) : undefined)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| messages | `ThreadMessage[]` |  | id, author, createdAt, text – assistant replies can add a status line with folding details |
| currentUser | `ThreadAuthor` |  | Author of new replies |
| assistant | `ThreadAuthor` |  | Shown with a thinking state while an answer is on its way |
| onReply | `(text) => ThreadMessage \| Promise<ThreadMessage \| void> \| void` |  | Return a message (or a promise) for the assistant to answer, nothing to just post |
| onClose | `() => void` |  | Shows a close button |
| title | `string` | `"Comment"` | Heading at the top of the card |

### Keyboard

- Enter: Send the reply
- Tab: Reach the status lines to fold their details open

### Accessibility

- Status lines are buttons with aria-expanded; folded details are inert
- The thread announces new replies politely

### Motion

- Replies fade in, the thinking text shimmers, details fold open – reduced motion turns this off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: comments-panel, chat-composer

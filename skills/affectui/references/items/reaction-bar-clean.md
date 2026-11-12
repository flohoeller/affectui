# Reaction Bar, clean style (Free)

Like, comment, repost and share in one pill – icons pop and fill, counts roll in digit by digit

- Page: https://www.affectui.com/components/reaction-bar
- Section: Components · Buttons
- Install: `npx shadcn@latest add https://www.affectui.com/r/reaction-bar-clean.json`
- Import: `@/components/ui/reaction-bar-clean`

### When to use

- Reactions under posts, comments or updates in a feed
- Any toggle with a public count, like saves or upvotes

### When not to use

- Actions that need a confirmation – a toggle gives none

### Usage

```tsx
import { ReactionBar } from "@/components/ui/reaction-bar-clean";

export function PostActions({ post }) {
  return (
    <ReactionBar
      reactions={{ like: { count: post.likes, active: post.liked }, comment: { count: post.comments } }}
      onReact={(key, state) => api.react(post.id, key, state.active)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| reactions | `Partial<Record<ReactionKey, { count; active? }>>` |  | Starting count and pressed state per action |
| onReact | `(key, state) => void` |  | Called after a toggle with the new count and state |
| actions | `ReactionKey[]` | `["like", "comment", "repost", "share"]` | Which actions to show, in order |
| className | `string` |  | Extra class on the row |

### Keyboard

- Tab: Move between the actions
- Enter / Space: Toggle the focused action

### Accessibility

- Every action is a toggle button with aria-pressed and a label that includes its count
- The rolling digits are decorative – the label carries the number

### Motion

- The icon shrinks and springs, your chip takes a light blue tint; the count glides to its new width and changed digits roll in
- Reduced motion turns this off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: button, comments-panel

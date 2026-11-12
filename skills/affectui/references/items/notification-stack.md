# Notification Stack (Free)

Notice cards stacked behind each other – dismiss the front one to reveal the next

- Page: https://www.affectui.com/components/notification-stack
- Section: Components · Feedback
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/notification-stack.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/notification-stack-clean.json` – lands as `notification-stack-clean.tsx`, import from `@/components/ui/notification-stack-clean` – its docs: `notification-stack-clean.md`
- Import: `@/components/ui/notification-stack`

### When to use

- A few announcements or notices in a corner of an app – releases, maintenance, invites
- Toast-style messages that stay until someone dismisses them

### When not to use

- Messages that need an answer before people continue – use a dialog
- Many notifications at once – past three or four, use an inbox or activity list

### Usage

```tsx
import { NotificationStack } from "@/components/ui/notification-stack";

const notices = [
  {
    id: "maintenance",
    badge: "Notice",
    title: "Scheduled maintenance",
    text: "We'll be offline on Sunday from 02:00 to 03:00 UTC.",
    action: { label: "View status", href: "/status", external: true },
    pattern: "grid",
  },
];

export function Notices() {
  return <NotificationStack notices={notices} onDismiss={(n) => markRead(n.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| notices | `Notice[]` |  | id, badge, title, text, action ({ label, href, onClick, external }) and pattern |
| onDismiss | `(notice: Notice) => void` |  | Called when a notice is dismissed with its close button |
| className | `string` |  | Extra class on the stack |

### Keyboard

- Tab: Move through the front card's buttons
- Enter / Space: Run the action or dismiss the notice

### Accessibility

- The stack is a labelled region; each card is an article named by its title
- Only the front card is read out and focusable; the next one takes its place after a dismiss

### Motion

- A dismissed card slides away and the next one moves up into its place; reduced motion turns this off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: decision-inbox, tips-panel

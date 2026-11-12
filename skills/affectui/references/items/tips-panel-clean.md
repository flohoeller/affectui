# Tips Panel, clean style (Free)

Grid of short tips with one action each – taken tips turn into a done state

- Page: https://www.affectui.com/components/tips-panel
- Section: Components · Cards
- Install: `npx shadcn@latest add https://www.affectui.com/r/tips-panel-clean.json`
- Import: `@/components/ui/tips-panel-clean`

### When to use

- Pointing new users to features they haven't tried yet
- A “What's new” or getting-started panel in a dashboard or a dialog

### When not to use

- Steps that build on each other – use the Setup Guide
- A single announcement – a banner or toast is lighter

### Usage

```tsx
import { Kbd, TipsPanel } from "@/components/ui/tips-panel-clean";

const tips = [
  { id: "search", title: "Quick search", description: <>Press <Kbd>⌘K</Kbd> to jump anywhere.</>, action: "Try it" },
  { id: "pro", title: "Ready for Pro?", description: "Unlimited projects and priority support.", action: "See plans", primary: true },
];

export function Tips() {
  return <TipsPanel tips={tips} onClose={() => setOpen(false)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| tips | `Tip[]` |  | id, title, description, action, doneLabel, primary and onAction |
| title | `string` | `"Tips"` | Heading at the top of the card |
| onClose | `() => void` |  | Shows a Close button in the last row of the card |
| closeLabel | `string` | `"Close"` | Text of the Close button |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Move between the tip actions and Close
- Enter / Space: Take the focused action

### Accessibility

- Each tip is a list item with a real button; the done state is announced as a status
- The counter in the heading is a polite live region

### Motion

- Tips fade in one after another; a taken tip pops into its done state
- Reduced motion turns both off

### Responsive

- Set --ui-tpc-max-height on the panel to change how tall the list grows before it scrolls (420px by default)
- Three columns, two below 560px panel width, one below 380px – based on the panel's own width
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: setup-guide, decision-inbox

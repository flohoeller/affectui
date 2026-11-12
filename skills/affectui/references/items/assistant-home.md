# AI Chat / Start (Pro)

AI assistant start page: greeting, prompt box with tools, connected apps and suggestions

- Page: https://www.affectui.com/screens/assistant-home
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/assistant-home.json` (needs the Pro access key)
- Import: `@/components/ui/assistant-home`

### When to use

- The first screen of an AI assistant or copilot
- A start page that leads straight into a prompt

### When not to use

- Apps where the chat is not the main action

### Usage

```tsx
import { AssistantHomeScreen } from "@/components/ui/assistant-home";

export default function Page() {
  return <AssistantHomeScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item or project |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: the quick prompts and the connected apps in the composer's tray show gray placeholders in the shape of the real ones (the shared Skeleton), so nothing jumps when the data lands; the composer stays and sending waits |
| className | `string` |  | Extra class on the root |

### Accessibility

- Sidebar items, projects and the collapse toggle are real buttons with labels
- The work area (folded away to start, its icon in the top right corner) has the App Shell's tabs: a New tab with the address field, Tools and Suggested; + opens another, × closes one, Delete closes the focused tab, and closing the last folds the work area – the focus moves to its open button
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Suggested in a New tab opens the sample artifacts – the launch checklist and the naming guide as documents, the launch budget as a sheet with formulas – in their own tab
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Chat Composer and Thinking State (installed with it)

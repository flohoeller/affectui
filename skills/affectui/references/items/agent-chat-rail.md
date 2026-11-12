# AI Chat / Double Sidebar (Pro)

A plain assistant chat with web search in a double sidebar, like Codex and ChatGPT – a column of icons on the page, the chats in a light gray column inside the main area with a project switcher, and what it found in the work area on the right

- Page: https://www.affectui.com/screens/agent-chat-rail
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-chat-rail.json` (needs the Pro access key)
- Import: `@/components/ui/agent-chat-rail`

### When to use

- An assistant or search chat in a product with several sections – chats, tasks, runs, files – where the chats need a column of their own
- Chats grouped by project, with a switcher to see one project's chats at a time

### When not to use

- An app with one list in its sidebar – the App Shell's single sidebar is enough

### Usage

```tsx
import { AgentChatRailScreen } from "@/components/ui/agent-chat-rail";

export default function Page() {
  return <AgentChatRailScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of an icon, a sidebar item or a project |
| workspace | `string` | `"Acme"` | The workspace – its initial tops the icon column and opens its menu |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | The account – its picture at the bottom of the icon column |
| loading | `boolean` |  | While the chat loads: the thread's messages and the Task panel as gray shapes in the shape of the real ones (the Agent / Thread loading state); sending waits |
| empty | `boolean` |  | No chats yet: the icon column and the project switcher stay, the chat column says no chats yet, the thread has no messages and the work area no files; the composer stays and sending waits; loading wins when both are on |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the icon column, then the sidebar, the chat and the work area
- ⌘ / K: Search, from anywhere in the app
- ↑ / ↓: In the project switcher and the menus
- Esc: Closes a menu, or the sidebar on narrow screens

### Accessibility

- The icon column is a labelled navigation; every icon names itself to screen readers and on hover, the open section is marked as the current page
- The project switcher marks the chosen project; while one is picked, only its chats are listed
- The conversation is Agent / Thread's: the searches fold into one line, the answer types in, Stop ends it, and what it made opens in the work area

### Responsive

- The icon column stays on the gray page; the chats are the main area's left part – a light gray column split from the chat by a line, as wide as you drag it
- On narrow screens (under 900px of the app) the icons and the sidebar slide in together as one drawer
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell and Agent / Thread (installed with it)

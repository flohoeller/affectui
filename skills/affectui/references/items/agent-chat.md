# AI Chat / Agents (Pro)

Chat with an orchestrating agent, the agents at work, and a brief to fill in beside it

- Page: https://www.affectui.com/screens/agent-chat
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-chat.json` (needs the Pro access key)
- Import: `@/components/ui/agent-chat`

### When to use

- The main view of an AI agent or copilot product
- Chats that end in a concrete task – a brief, a draft, a report

### When not to use

- Plain support chat – a lighter chat layout is enough

### Usage

```tsx
import { AgentChatScreen } from "@/components/ui/agent-chat";

export default function Page() {
  return <AgentChatScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the chat opens from history: the chat's name, the thread (your message, the answer's lines, the agents at work) and the brief's sections show gray placeholders in the shape of the real ones (the shared Skeleton), so nothing jumps when the data lands; the composer stays and sending waits |
| empty | `boolean` |  | No chat yet: the sidebar lists no chats, the thread shows “No chats yet” with a short line and a Start a chat button (onNavigate("New chat")), and the brief’s Brief, Assets and Activity each say what will show up there; the composer stays and sending waits; loading wins when both are on |
| className | `string` |  | Extra class on the root |

### Accessibility

- The brief is the first tab of the App Shell's work area; its Files – brand-guide.md, launch-budget.csv and the product-photos folder – open in tabs of their own, in the shared viewers (a document to write in, a sheet with formulas, a folder with Quick Look); + opens a New tab with them under Suggested
- The tabs are a tablist – ← → move, Delete closes the focused tab, every × is labelled; closing the last folds the work area and the brief comes back when it opens again
- Sidebar items, tabs and toolbar actions are real buttons with labels
- Icons are decorative and hidden from screen readers

### Responsive

- Fills its container – give it the full viewport height in your app
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, AI Chat / Start (for its chat thread), Chat Composer, Thinking State and Button (installed with it)

# AI Chat / Progress (Pro)

A plain chat with what the assistant is doing beside it, part of the page – its progress step by step, what it made, and the uploads, apps, web search and skills it used

- Page: https://www.affectui.com/screens/agent-chat-progress
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-chat-progress.json` (needs the Pro access key)
- Import: `@/components/ui/agent-chat-progress`

### When to use

- A chat where the assistant works through a task with tools – and people want to see how far it got and what it made, without leaving the conversation
- Agents that write files or use connected apps: the outputs and the apps it touched stay in view beside the chat

### When not to use

- Editing what it made side by side with the chat – AI Chat with its work area fits that better
- A quick question and answer – a plain chat is enough

### Usage

```tsx
import { AgentChatProgressScreen } from "@/components/ui/agent-chat-progress";

export default function Page() {
  return <AgentChatProgressScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with Folders from an output |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the chat loads from history: gray placeholders for the messages, the tool calls, the steps, the outputs and what was used, in the shape of the real ones (the shared Skeleton) – the composer and the panel's sections stay, sending waits until it has landed |
| empty | `boolean` |  | No chat yet: the sidebar lists no chats, the thread shows “No chats yet” with a short line and a Start a chat button (onNavigate("New chat")), Progress says no steps yet and Outputs and Used in this session stay away; the composer stays and sending waits; loading wins when both are on |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the tool calls, the composer, the panel's button in the bar, and the panel's sections, steps and outputs
- Esc: Narrow: closes the panel over the chat and returns to the button in the bar
- Enter / Space: Opens a tool call's arguments and result, folds a section, or shows the earlier steps

### Accessibility

- The panel is a labelled region beside the chat; its button in the bar says whether it's open and how many outputs there are
- Tool calls are the Tool Call Card – a button with aria-expanded and its status in words; section heads are buttons with aria-expanded too; closed folds are inert, so focus never lands inside them
- Progress is a list that announces new steps; each step says in words whether it's done or running – not only by its mark
- Long file names give way in the middle – the end and the extension stay, so files that differ at the end stay apart; the full name is in the title and read as one piece
- Nothing made yet, the Outputs section stays away and the bar's button shows no count; no steps yet, Progress says so in a line

### Responsive

- The panel is part of the page, split from the chat by a line; closing it gives the chat the room
- Narrow, it starts closed, slides over the chat from the right and closes with its × or Esc
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Chat Composer and Tool Call Card (installed with it)

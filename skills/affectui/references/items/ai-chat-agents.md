# AI Chat / Agent Run (Pro)

A narrow chat beside the agents working on your prompt – watch each one's steps on a dot grid; when one gets stuck it says so in the chat and you answer right there

- Page: https://www.affectui.com/screens/ai-chat-agents
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/ai-chat-agents.json` (needs the Pro access key)
- Import: `@/components/ui/ai-chat-agents`

### When to use

- A chat that hands the work to a team of agents – you see who does what while it happens, not only the answer at the end
- Runs that sometimes need you: a missing connection, an approval before something is sent, a step that failed – answer in the chat or right on the agent

### When not to use

- A big multi-level run with traces and costs – use Agent / Orchestration
- A chat with charts in the answers – use AI Chat / Revenue Analyst

### Usage

```tsx
import { AgentRunChatScreen } from "@/components/ui/ai-chat-agents";

export default function Page() {
  return (
    <AgentRunChatScreen
      onPrompt={(prompt) => runs.start(prompt)}
      onResolve={(agent, block, action) => runs.answer(agent, block, action)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| prompt | `string` | `"Prepare the Q4 board report…"` | The prompt the screen opens with – the sample run plays it; empty starts with the team idle |
| onPrompt | `(prompt: string) => void` |  | Called when a prompt is sent – start your run here and feed its agents, steps and blocks into your copy of the screen |
| onResolve | `(agent, block, action) => void` |  | Called when a block is answered – the same buttons show in the chat (full words) and on the agent's card (short ones, e.g. Connect / Skip, Retry / Skip), either one moves both on. A block with tone "error" is a failure in red, otherwise it waits for you in amber |
| chats | `ShellChat[]` |  | The chats in the sidebar |
| loading | `boolean` |  | Gray lines in the chat and gray cards on the canvas |
| empty | `boolean` |  | No run yet – the team waits, idle, and the assistant offers a first prompt |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Into the agents – one Tab stop, then the block's buttons
- ← / →: Along the agents
- ↑ / ↓: Up to the orchestrator and back down
- Enter: Open an agent's steps on the right, Enter again to close
- Esc: Close the steps

### Accessibility

- Each agent is named with its role and state, and what it's stuck on; the block's buttons are a labelled group, the same in the chat
- The thread is a live region – new messages and blocks are read out
- Rings show for the keyboard only – never on the composer

### Motion

- Each sub-agent has its own color – its mark, its line and the light on it; a light keeps running to each one that works, full at the start and fading out on the way
- A block drops in under its card – amber when it waits for you, red when it failed – and the line to it turns dashed; if the card is out of sight the canvas glides to it, and it glows once; and once, a soft wave starts where its line comes in, runs out over the card's white and fades; a thin ring drifts off its edge
- Clicking a card lays its steps over the canvas on the right, like the App Shell's work area – the agents stay where they are
- The assistant's words arrive a few at a time; with prefers-reduced-motion nothing runs or twinkles

### Responsive

- The sidebar starts folded; the chat keeps 380px (330 on narrower screens), the canvas the rest – a light gray dot grid that zooms like Agent / Orchestration's – and fits the team in; the run, its progress and what needs you float on top
- On phones Chat and Agents switch at the top – Agents gets an amber dot when one needs you – and the agents hang one below the other
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Assistant Home and Chat Composer (installed with it)

Related: agent-orchestration, ai-chat-revenue, ai-chat-spend, agent-chat

# Agent / Agents (Pro)

Your team of agents in one place – calm cards with each agent's pixel mark, role, status tag and the apps it may use, its model, runs and spend; an agent opens on the right with its runs, instructions, skills, apps and recent tasks, and New agent draws the mark as you type

- Page: https://www.affectui.com/screens/agents
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agents.json` (needs the Pro access key)
- Import: `@/components/ui/agents`

### When to use

- Showing every agent you run – who it is, what it does and what it is doing right now
- Pausing an agent, messaging it, or checking what it may use before you trust it with more
- Adding a new agent to the team

### When not to use

- The tasks the agents work on – use Agent / Inbox Board
- What one agent may do in your apps – use Agent / Permissions
- Spend across all agents over time – use Agent / Usage

### Usage

```tsx
import { AgentsScreen } from "@/components/ui/agents";

export default function Page() {
  const [agents, setAgents] = useState(initialAgents);
  return (
    <AgentsScreen
      agents={agents}                                   // working agents show what they do right now
      onPause={(agent, paused) => api.setPaused(agent.id, paused)}
      onMessage={(agent) => router.push(`/thread?agent=${agent.id}`)}
      onCreate={(agent) => api.createAgent(agent)}     // from New agent
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `{ id; name; role; color; model; status: "working" \| "idle" \| "paused"; doing?; lastRun?; runs; cost; daily?; owner?; instructions?; skills?; apps?; recent?: { title; state; at }[] }[]` |  | Every agent. doing is what a working agent does right now (shown on the right); apps the apps it may use – logos on the card; lastRun shows for idle and paused agents; runs and cost are this week's; daily the runs per day for the chart on the right. Pass a stable array (state) |
| defaultView | `"grid" \| "list"` | `"grid"` | Grid or list when the screen starts |
| defaultOpen | `string \| null` | `"builder"` | The agent open on the right when the screen starts |
| onPause | `(agent, paused) => void` |  | Called with Pause or Resume on the right |
| onMessage | `(agent) => void` |  | Called with Message – without it the screen calls onNavigate("Thread") |
| onCreate | `(agent) => void` |  | Called with an agent made in New agent – name, what it does, model (Claude, GPT, Gemini or Grok, each with its maker's logo) and color |
| loading | `boolean` |  | Gray cards in place of the agents, and the panel as gray lines in its own layout |
| empty | `boolean` |  | No agents yet – one quiet note with New agent |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with "Skills" and "Permissions" from the panel |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K / ← / → / ↑ / ↓: From agent to agent
- Enter: Open the agent on the right
- ← / →: On the tabs and on Grid / List: the next one
- Esc / ⌘ Enter: In New agent: close, or create it

### Accessibility

- Each agent is a button named with its name, role and what it is doing; the one open on the right is marked current
- A polite live region says how many agents work, idle and are paused
- Grid and List carry their names for screen readers and in a tip; rings show for the keyboard only and sit on the card's edge

### Motion

- A working agent's mark twinkles; on the right its green dot breathes
- A new agent lands out of a blur, and a light blue wave runs over its card once
- The runs chart on the right grows in bar by bar
- With prefers-reduced-motion nothing moves

### Responsive

- The content is capped at 720px in the middle, cards in two columns – one on phones; the whole area scrolls, so no card edge or hover shadow is cut
- List rows drop the role and model below 720px, the numbers below 560px
- Below 560px the tools move above the tabs and New agent becomes a +
- Touch targets grow to 36px on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-inbox-board, agent-permissions, agent-skills, agent-usage

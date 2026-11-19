# Agent / Tool Calls (Pro)

One agent and the tools it can call, as an org chart – see which one it calls right now, solve what failed, pause or connect tools, and every call below with what went in and came back

- Page: https://www.affectui.com/screens/agent-tool-calls
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-tool-calls.json` (needs the Pro access key)
- Import: `@/components/ui/agent-tool-calls`

### When to use

- Showing what one agent can do and what it did – its tools under it as an org chart, and every call it made with its input and output
- Debugging an agent's tool use: which tool is slow, which one fails, what it was called with and what came back
- Letting people decide per tool whether the agent may call it on its own, has to ask first, or not at all

### When not to use

- Many agents handing work to each other – use Agent / Orchestration
- One run as bars on a time axis – use Trace Waterfall
- Permissions for a whole workspace – use Agent / Permissions

### Usage

```tsx
import { AgentToolCallsScreen } from "@/components/ui/agent-tool-calls";

export default function Page() {
  return (
    <AgentToolCallsScreen
      agent={agent}
      tools={agent.tools}
      calls={calls}
      now={Date.now()}
      onResolve={(call, answer) => api.answer(call.id, answer)}
      onModeChange={(tool, mode) => api.setMode(agent.id, tool.id, mode)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar |
| agent | `{ id; name; task; model; maker? }` |  | The agent in the middle – its pixel mark comes from its id; maker (anthropic, openai, google) picks the model's mark |
| tools | `{ id; name; fn; logo?; icon?; source; description; mode?: "auto" \| "ask" \| "off"; params?: { name; type; required? }[] }[]` |  | Its tools – logo is the app's own mark (any node; the sample has Chrome, a macOS folder, Notion, Stripe, Linear, Slack and Gmail), icon a Hugeicons glyph for tools without one. source is the small tag (Built-in, MCP · Notion), fn the function the model calls; mode is how it may run: on its own, after someone approves each call, or not at all |
| calls | `{ id; tool; at; ms?; status: "running" \| "waiting" \| "done" \| "failed" \| "rejected"; input; output?; error?; tokens?; run? }[]` |  | Every call, in any order – at is a timestamp in ms, input the arguments as an object, tokens what the result added to the agent's context. A running call counts up; a waiting one can be approved or rejected in its panel |
| now | `number` | `Today, 09:41` | What now is when the screen opens – times, "today" and the time range are counted from it |
| live | `boolean` | `true` | Whether the clock runs on – running calls count up; with the sample data the agent keeps making calls |
| defaultRange | `"today" \| "7d" \| "30d"` | `"today"` | The time range in the path – cards, numbers and the table count the calls in it |
| onSelect | `(selection: { kind: "agent" \| "tool" \| "call"; id } \| null) => void` |  | Called when the agent, a tool or a call opens on the right, and with null when it closes |
| onResolve | `(call, answer: "approve" \| "reject") => void` |  | An answer to a call that waits for you |
| onModeChange | `(tool, mode: "auto" \| "ask" \| "off") => void` |  | A tool's access changed in its panel – Allowed (auto), Ask first (ask) or Paused (off) |
| onDisconnect | `(tool) => void` |  | Disconnect at the foot of a tool's panel, after a second click to confirm – the card and its line go, its calls stay in the table |
| onAddTool | `() => void` |  | Connect tool – at the top right, in the agent's panel and in the empty state |
| onPause | `(paused: boolean) => void` |  | Pause agent and Resume |
| loading | `boolean` |  | Gray cards where the agent and its tools land, the lines gray and still, gray rows in the table and no figures |
| empty | `boolean` |  | An agent without tools: its card alone with a dashed place for the first tool, and an empty table that offers Connect tool |
| layout | `"canvas" \| "compact" \| "org"` | `"org"` | org: the agent on top, its tools in two rows below it on one line, like an org chart. compact: small cards left and right of the agent. canvas: a dotted canvas to pan and zoom with full cards |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Into the chart – it's one Tab stop: the agent's card, or the card you were on
- ← / → / ↑ / ↓: To the nearest card that way – from the agent down to its tools, along a row and between the rows
- Home / End: To the agent, or the last tool
- Enter: Open the card's panel, or close it again – on a call row, the call's
- ↑ / ↓: In the table: from call to call – the table is one Tab stop; on its top edge, make it taller or shorter
- Esc: Close the picker or the panel – the focus goes back where it came from
- Alt / ←: layout="canvas" only: pan with Alt and the arrows, + and - to zoom, ⇧1 to fit

### Accessibility

- Cards are a list with their name, source, state, mode and numbers read out; the table names every call with its time, tool, status, duration and input
- Tabs, the mode switch and the time range menu follow their ARIA patterns; the panel is a region, on a phone a modal sheet that keeps the focus inside
- Rings show for the keyboard only – rows and options inside the panels get them inside their edge

### Motion

- While a tool is called a light runs along its connector from the agent to it, the agent's pixel mark twinkles and the call's duration counts up in its row
- New calls rise in at the top of the table; opening a tool fades the other cards and lines, and the chart moves aside for the panel
- In the picker only the tool's tile in the art swaps in as you move through the list
- With prefers-reduced-motion nothing flows, twinkles or slides – the lines stay blue and the state chips say what happens

### Responsive

- The tools sit in two rows; when the room runs short they wrap, and the line runs down between two cards to the next row
- The table takes up to half the screen – drag its top edge like a sidebar; the chart keeps the rest and stays centred in it
- Narrower screens drop the run column, then the tokens; on phones the table keeps time, tool, status and duration, the buttons turn into icons and the panel becomes a sheet from the bottom
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-orchestration, agent-run, agent-permissions, agents

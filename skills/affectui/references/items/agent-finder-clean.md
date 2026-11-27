# Agent Finder, clean style (Pro)

A multi-agent run as a macOS Finder window – every agent a folder, every tool call a document, with Quick Look for what was sent and what came back

- Page: https://www.affectui.com/components/agent-finder
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-finder-clean.json` (needs the Pro access key)
- Import: `@/components/ui/agent-finder-clean`

### When to use

- Browsing a multi-agent run the way people browse files – every agent a folder, its subagents inside, every tool call a document
- Looking back at what each agent did: open a document and Quick Look shows what the tool was sent and what came back
- A run people want to arrange and act on themselves – drag folders where they like them, pause, restart or retry from a right-click

### When not to use

- Who does what when, and where work is handed over – use Handoff Swimlanes or Agent Metro Map
- The hierarchy at a glance, all at once – use Agent Tree or Agent Org Chart
- Every message and tool call in time order – use Agent Sequence or Trace Waterfall

### Usage

```tsx
import { AgentFinder, type FinderAgent } from "@/components/ui/agent-finder-clean";

const agents: FinderAgent[] = [
  {
    id: "planner", name: "Planner", status: "running", progress: 0.6,
    model: "Claude Opus 5.5", logo: <ClaudeLogo />, task: "Ship v2.4", tokens: 48210, cost: 1.42, updated: "Now",
    children: [
      {
        id: "researcher", name: "Researcher", status: "done", model: "Claude Sonnet 5.5", logo: <ClaudeLogo />,
        files: [
          {
            id: "search", name: "search_code.json", logo: <GitHubLogo />, tool: "github.search_code",
            size: "18 KB", duration: "1.2 s", updated: "Today, 09:04",
            request: '{ "q": "round( path:billing/" }', response: '{ "total_count": 14 }',
          },
        ],
      },
    ],
  },
];

export function Run() {
  return <AgentFinder title="Launch v2.4" subtitle="Started today, 08:52" agents={agents} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `FinderAgent[]` |  | The top folder's contents – { id, name, status?, model?, logo?, task?, tokens?, cost?, updated?, progress?, children?, files? } |
| status | `"running" \| "waiting" \| "failed" \| "done" \| "idle"` |  | The agent's Finder tag – blue, orange, red, green; idle has none |
| progress | `number` |  | 0–1 – the bar under a running agent's folder; without it the bar shimmers |
| children / files | `FinderAgent[] / FinderFile[]` |  | The folder's contents – subagents first, then documents, like Finder sorting folders on top |
| FinderFile | `object` |  | { id, name, type?, logo?, tool?, detail?, size?, duration?, updated?, failed?, request?, response? } – type defaults to the name's extension |
| title / subtitle | `string` |  | The top folder's name, and a line under it – when the run started, how long it took |
| defaultView | `"icons" \| "list"` |  | Icons by default |
| onOpen / onOpenFile | `(agent) => void / (file, agent) => void` |  | An agent's folder or a document opened – with a double-click, Enter or the menu |
| onSelect | `(agent \| null, file?) => void` |  | The selection changed – an agent, or a document and the agent it belongs to |
| onAction | `(action, agent, file?) => void` |  | Something picked in the right-click menu – open, info, quick-look, pause, start, restart, duplicate, copy-id, retry, copy-request, copy-response, remove |
| onArrange | `(positions, folder \| null) => void` |  | Icons moved in a folder – where every icon in it now sits, { x, y } in pixels |
| className | `string` |  | An extra class on the root |

### Accessibility

- The icon view is a listbox and the list a treegrid – one item is in the tab order, the arrows move between them
- In the icon view the arrows go to the nearest icon in that direction, wherever the icons were put; Home and End go to the first and last in reading order
- Enter opens a folder or a document, Space opens Quick Look, ⌘↑ or Backspace goes up, ⌘[ and ⌘] go back and forward; → and ← open and close folders in the list
- ⌥ and an arrow move the selected icon by one place – the keyboard's way to drag
- Shift F10 or the menu key opens the right-click menu; a long press does on a touch screen. The menu moves with the arrows, Home, End and first letters; Esc closes it and focus goes back
- Every item reads as its name, its status and what it holds – "Writer, Waiting, 2 subagents, 1 document" or "staging-login.log, Log file, failed"
- Quick Look and Get Info are dialogs that keep focus inside and give it back when they close
- A focus ring shows only for the keyboard

### Motion

- Icons pop in one after another when a folder opens
- A running agent's pixel mark twinkles in a diagonal wave and its progress bar grows smoothly
- A dragged icon follows the pointer and stays exactly where it's let go; icons that make room glide
- Quick Look and the menu scale in, Get Info slides up
- Reduced motion turns all of it off

### Responsive

- Fills its container's width; the preview shows from 800px – narrower, Get Info opens it as a sheet
- The list drops the model column first, then the tokens, so names keep their room
- On a phone the icons sit three to a row; touch long-press opens the menu
- Icons put somewhere stay there; when the window gets narrower they move in so none falls off the edge
- Long names wrap to two lines under an icon and end in … in the list; big token counts shorten to 2.4B there and show in full in the preview
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Build the tree from the run: each agent with its subagents as children and one file per tool call
- Name files with an extension that fits what the call returned – .json for API results, .log for shell output, .pdf or .md for pages
- Keep request and response short and readable – they're shown as they are in Quick Look
- A parent can't be further along than a subagent it waits for – keep its status and progress behind

### Requirements

- React 19

Related: agent-tree, agent-org-chart, trace-waterfall, agent-sequence

# Repo Map (Pro)

A codebase as a treemap with coding agents working on it – every folder a group, every file a tile as large as its lines, in Context Map's tiles. Each agent is its pixel mark hopping from file to file; a file it edits fills with its color from the bottom up with a sheen running over it and keeps the color once it moves on, so the map fills as the work goes on. A file it only reads gets a dashed edge, two agents in one file blink orange. Point at a file for its path, lines and who changed what; click an agent to keep its files clear

- Page: https://www.affectui.com/components/repo-map
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/repo-map.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/repo-map-clean.json` (needs the Pro access key) – lands as `repo-map-clean.tsx`, import from `@/components/ui/repo-map-clean` – its docs: `repo-map-clean.md`
- Import: `@/components/ui/repo-map`

### When to use

- Coding agents working on one codebase – which files each one is in, what it changed and where they get in each other's way
- A run's footprint at a glance: the map fills with each agent's color as it works
- Spotting two agents editing the same file before their changes collide

### When not to use

- What fills one agent's context window – use Context Map
- A branch's commits one after another – use Commit Trail
- Changes as lines of code – use a diff view such as Diff Timeline

### Usage

```tsx
import { RepoMap, type RepoAgent, type RepoFile } from "@/components/ui/repo-map";

const files: RepoFile[] = [
  { path: "src/lib/auth.ts", lines: 320, edits: [{ agent: "auth", added: 64, removed: 12 }] },
  { path: "src/lib/session.ts", lines: 240 },
  { path: "src/components/LoginForm.tsx", lines: 210 },
  { path: "tests/auth.test.ts", lines: 230 },
];

const agents: RepoAgent[] = [
  { id: "auth", name: "Auth agent", file: "src/lib/session.ts", action: "edit", task: "Adding token refresh" },
  { id: "tests", name: "Test agent", file: "tests/auth.test.ts", action: "read" },
];

export function Workspace() {
  return <RepoMap title="acme/web" branch="feat/token-refresh" files={files} agents={agents} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| files | `RepoFile[]` |  | Every file – { path, lines, edits? }. The folder in its path groups it, its lines are its area; a path given twice shows once |
| edits | `{ agent, added?, removed? }[]` |  | Per file, oldest first – who changed it and how much. The last one's agent tints the file; the tile shows +added −removed |
| agents | `RepoAgent[]` |  | The agents – { id, name, color?, file?, action?, task? }. Each is its pixel mark in a color of the palette (blue when it works alone), sitting on the file it is at |
| action | `"edit" \| "read"` |  | Per agent – edit (default) fills the file with its color and runs a sheen over it; read gives it a dashed edge. Two agents editing one file make it blink orange |
| title / branch | `string` |  | The repo's name and its branch, in the bar |
| depth | `number` |  | How many folder levels group the files – 2 by default (src/components, src/lib …) |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-rpm-height |

### Keyboard

- Tab: The agents in the bar, then one stop for the map
- ← / → / ↑ / ↓: Walk the files, folder by folder – each shows its card
- Home / End: First or last file
- Enter / Space: On an agent: keeps its files clear and fades the rest
- Esc: Hides the file's card, or clears the agent you look at

### Accessibility

- Every file reads its path, its lines, who is in it and who changed what – "src/lib/session.ts, 240 lines, conflict, Auth agent and UI agent editing"
- The agents in the bar are toggle buttons (aria-pressed) that say how many files each touched
- A polite live region says when an agent moves to another file
- Focus rings show for the keyboard only (:focus-visible), inside the tiles so the map never cuts them

### Motion

- An agent's mark hops from file to file on a soft ease and twinkles in a diagonal wave while it writes
- A file fills with the agent's color from the bottom up when it starts on it, and a sheen runs over it while it writes
- A conflict blinks orange until one of them moves on
- With prefers-reduced-motion the marks jump, the files tint at once and nothing blinks

### Responsive

- The map keeps its height and lays the files out again for any width – a file's name and its count show while there's room
- Narrow: a taller map, the count on its own line, the agents wrap
- Long paths and names end in … with the full text on hover and in the file's card
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give agents stable ids – their color and their mark come from it
- Keep the order of files stable – the treemap keeps neighbours next to each other, so the map doesn't jump
- Add an edit when an agent moves on from a file it wrote, and point file at where it is now

### Requirements

- React 19

Related: context-map, agent-cursors, conflict-radar, commit-trail

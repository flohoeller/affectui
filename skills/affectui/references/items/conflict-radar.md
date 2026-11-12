# Conflict Radar (Pro)

Agents working on their own branches at once, and where they get in each other's way – a row per file and a column per agent, a line between the agents that changed the same lines, each agent's way in one sentence to pick from, and Merge once all are settled

- Page: https://www.affectui.com/components/conflict-radar
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/conflict-radar.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/conflict-radar-clean.json` (needs the Pro access key) – lands as `conflict-radar-clean.tsx`, import from `@/components/ui/conflict-radar-clean` – its docs: `conflict-radar-clean.md`
- Import: `@/components/ui/conflict-radar`

### When to use

- Several coding agents work on their own branches of the same repo at once, and people need to see where they overlap before anything is merged
- Agents came up with different ways to solve the same thing and someone has to pick one

### When not to use

- When the agents try the same task and the best one simply wins – use Parallel Attempts
- When the timeline matters – use Agent Lanes
- For a single agent's changes – use Agent Ledger

### Usage

```tsx
import { ConflictRadar, type RadarAgent, type RadarFile } from "@/components/ui/conflict-radar";

export function Branches({ agents, files }: { agents: RadarAgent[]; files: RadarFile[] }) {
  const [resolved, setResolved] = useState<Record<string, string>>({});
  return (
    <ConflictRadar
      agents={agents} // { id, name, model?, avatar?, status?: "running" | "done" }
      files={files} // { path, edits: [{ agentId, lines: [from, to], summary?, active? }] }
      resolved={resolved}
      onResolve={(path, agentId) => setResolved((r) => ({ ...r, [path]: agentId }))}
      onMerge={() => mergeBranches(resolved)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `RadarAgent[]` |  | One column each: name, model or branch, a mark, and whether it's still working |
| files | `RadarFile[]` |  | One row each, with every agent's edit – the lines it changes, whether it's still writing, and for conflicts its way in one sentence |
| title | `string` | `"Parallel work"` | Heading in the bar |
| resolved | `Record<string, string>` |  | The agent picked per conflicting file – leave it out and the component keeps the picks itself |
| onResolve | `(path: string, agentId: string) => void` |  | A way was picked for a conflict |
| onMerge | `() => void` |  | Merge was clicked – it's only enabled once every conflict is settled and every agent is done |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through Merge, the conflicting files and the ways to settle the one in focus
- Enter / Space: On a conflicting file: shows its ways below; on a way: keeps it

### Accessibility

- The grid is a table with the agents as column headers; every cell says who changed the file and whether it was kept
- Conflicts and settled files are named in text, not only by color
- The ways to settle a conflict are a radio group
- The comparison is a polite live region, so the next conflict is announced when it comes into focus

### Motion

- Bars grow in from the left when an agent touches a file; a sheen runs over them while it's still writing
- A conflict draws a line between the agents' bars, with a glow running along it until it's settled
- Pointing at a bar shows who changed which lines; pointing at an agent shows its numbers – files, open conflicts, kept
- Respects prefers-reduced-motion

### Responsive

- Below 440px agent names and folders drop, the columns get smaller and a way's sentence moves under its name
- Dark mode built in; colors are CSS variables on .ui-cr

### Requirements

- React 19

Related: parallel-attempts, agent-lanes, agent-ledger

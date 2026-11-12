# Diff Timeline, clean style (Pro)

What an agent changed in a pull request, edit by edit – lines added and removed as two lines laid over each other, each file with its own diff bar as the agent reaches it, and every edit's diff on hover

- Page: https://www.affectui.com/components/diff-timeline
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/diff-timeline-clean.json` (needs the Pro access key)
- Import: `@/components/ui/diff-timeline-clean`

### When to use

- Showing what a coding agent did to a pull request – live while it works, or as a replay afterwards
- Review screens where people want to see when the big changes happened and which files they touched

### When not to use

- Hundreds of edits or files – the rows get too thin; group them by folder first
- Comparing more than one agent – this shows one run

### Usage

```tsx
import { DiffTimeline } from "@/components/ui/diff-timeline-clean";

export function PullRequestRun({ edits, elapsed, running }) {
  return (
    <DiffTimeline
      agent={{ id: "frontend", name: "Frontend agent" }}
      context="PR #214"
      edits={edits}       // [{ at: 30, file: "components/hero.tsx", added: 44, removed: 0, diff: [...] }]
      elapsed={elapsed}   // seconds since the run started
      live={running}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agent | `{ id: string; name: string }` |  | The agent – its id gives it its own pixel mark |
| context | `string` |  | Quiet text after the name, e.g. the pull request |
| edits | `DiffEdit[]` |  | Every edit: at (seconds), file, added, removed and optional diff lines. The scales come from all of them, so nothing rescales while the run plays |
| elapsed | `number` | `the last edit` | Seconds since the run started – later edits stay hidden |
| live | `boolean` | `false` | Still writing: the mark twinkles, the line ends glow and the status names the file |
| duration | `number` | `the run, rounded up to a minute` | Length of the time axis in seconds |
| maxRows | `number` | `7` | File rows shown before the list scrolls – the card keeps one height however many files the run touches |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Focus the chart
- ← / →: Step to the previous or next edit
- Home / End: First or last edit
- Esc: Close the edit

### Accessibility

- The chart is one focusable group, readable edit by edit with the arrow keys
- Hovering a file row marks its edits on the chart's baseline
- The open edit is a polite live region: file, time, totals and the changed lines are read out
- The status line is live too, so the file the agent is on is announced while it works

### Motion

- While live, the line ends breathe out a soft ring and the agent mark twinkles
- Each file's row rises in out of a soft blur when the agent first touches it, its bar grows from the left and every new edit's piece widens into it
- A soft wash glides to the row of the file being edited now; reduced motion turns all of it off

### Responsive

- Fills its container; the chart and the rows scale with it, line widths stay crisp
- Below 440px the totals move under the name, folders hide and counts shorten (4.8k)
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: inline-diff, change-summary, trace-waterfall

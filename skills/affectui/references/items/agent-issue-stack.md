# Agent Issue Stack (Pro)

Issues your agents found or are working on, one card at a time – kind, pull request, priority, users touched and the agent on it, as a stack or a cycling strip

- Page: https://www.affectui.com/components/agent-issue-stack
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-issue-stack.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-issue-stack-clean.json` (needs the Pro access key) – lands as `agent-issue-stack-clean.tsx`, import from `@/components/ui/agent-issue-stack-clean` – its docs: `agent-issue-stack-clean.md`
- Import: `@/components/ui/agent-issue-stack`

### When to use

- A small spot that shows what your agents are on right now – one issue at a time, going on by itself
- A dashboard corner, a sidebar or a landing page where a full list would be too much and a single card says enough
- Work of any kind side by side – fixes, features, upgrades, docs – each with its pull request or branch, priority and the agent on it

### When not to use

- Going through every issue, sorting or filtering them – use Agent Inbox or a list
- Issues waiting for a person to approve or reject – use Approval Gates
- What an agent did step by step – use Agent Sequence or Trace Waterfall

### Usage

```tsx
import { AgentIssueStack, type AgentIssue } from "@/components/ui/agent-issue-stack";

const issues: AgentIssue[] = [
  {
    id: "auth",
    ref: { kind: "pr", label: "#412" },
    icon: <KeyIcon />, color: "#EE3E9E", time: "4 min ago",
    title: "Fix sign-up after the auth key rotation",
    text: "New accounts failed to create sessions once the signing key rotated. Triage found the cause and is testing the fix.",
    priority: "high", users: 78,
    owner: { id: "triage", name: "Triage", working: true },
  },
  {
    id: "csv",
    ref: { kind: "branch", label: "feat/csv-export" },
    icon: <CardIcon />, color: "#F28A2E", time: "18 min ago",
    title: "Add CSV export to the billing page",
    priority: "medium", diff: { add: 214, del: 12 },
    owner: { id: "coder", name: "Coder", color: "rgba(166, 81, 240, 0.85)", working: true },
  },
];

export function Issues() {
  return <AgentIssueStack issues={issues} label="Issues the agents found" />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| issues | `AgentIssue[]` |  | { id, title, text?, icon?, color?, ref?, time?, priority?, users?, diff?, owner? } – in the order they come up |
| variant | `"stack" \| "cycle"` |  | Stack – the cards behind peek out like toasts; cycle – strips above and below the open card. Stack by default |
| autoPlay | `boolean` |  | Goes on to the next issue by itself – on by default; hover, focus, a hidden tab and reduced motion pause it |
| interval | `number` |  | How long each issue stays in front, in ms – 3200 by default, never under 1200 |
| label | `string` |  | The name screen readers give the carousel – "Issues" by default |
| onChange | `(issue, index) => void` |  | The issue in front changed – by itself or by the user |
| icon / color | `ReactNode / string` |  | A small glyph for the kind of work and the tint of its tile – the icon's own color works best |
| ref | `{ kind: "pr" \| "merged" \| "branch"; label: string }` |  | Where the work lives, with its icon – shown next to the tile and on the strip |
| priority | `"urgent" \| "high" \| "medium" \| "low"` |  | Signal bars – one, two or three lit; urgent lights all three in red-orange. Medium by default |
| users / diff | `number / { add, del }` |  | How many users it touches, or the size of the change – big numbers shorten to 12.4K |
| owner | `{ id, name, color?, working? }` |  | The agent on it – its pixel mark comes from the id, in its color; working makes it twinkle and reads "Name is on it" |
| className | `string` |  | An extra class on the root |

### Accessibility

- A carousel region with its label; each card is a slide that reads "2 of 6: Add CSV export to the billing page"
- One tab stop: the arrows go to the next and previous issue, Home and End to the first and last
- Focus or hover pauses it, so nothing moves away while someone reads; the new issue is announced only while it's paused
- The stack's buttons are labelled Previous issue and Next issue; a focus ring shows only for the keyboard
- Priority, users and the change size have text next to their icons and a title with the full wording

### Motion

- Stack: the front card slides down and fades, then joins the back while the next moves up; the cards behind sit a little higher, smaller and fainter
- Cycle: the strip above grows into the card while the open one folds into the strip below – the content blurs in once the card has grown
- The working agent's pixel mark twinkles in a diagonal wave
- A swipe sideways on the stack's front card goes on – left to the next, right back
- Reduced motion turns all of it off and stops it going on by itself
- The classic style has rounder cards with a hairline border, round buttons and firmer type – the same behavior as the clean one

### Responsive

- Up to 360px wide, narrower in a smaller container; the open card keeps its layout while it grows
- Long titles end in …, the text stays at two lines, a long branch name shortens before the time does
- In a narrow container (under 320px) the cycle's strips show only the tile and the title
- Fixed heights – cards don't jump between short and long issues
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- One issue per piece of work, newest or most urgent first
- Keep titles short enough for one line and the text to two short sentences – what happened and what the agent does about it
- Use users for issues that hit people and diff for changes in code; leave out what you don't know
- Give each agent a stable id – its pixel mark comes from it – and set working only while it's on the issue

### Requirements

- React 19

Related: agent-inbox, approval-gates, collaboration-stream, agent-sequence

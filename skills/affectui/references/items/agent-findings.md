# Agent Findings (Pro)

A swarm of agents checking something – one calm row per agent with its progress, and their findings sliding into a short feed as they're found

- Page: https://www.affectui.com/components/agent-findings
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-findings.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-findings-clean.json` (needs the Pro access key) – lands as `agent-findings-clean.tsx`, import from `@/components/ui/agent-findings-clean` – its docs: `agent-findings-clean.md`
- Import: `@/components/ui/agent-findings`

### When to use

- Several agents check, audit or verify something in parallel and people want to follow along without drowning in detail
- Security reviews, code audits, test runs, data checks – anything that turns up findings as it goes

### When not to use

- When it matters who started whom – use Agent Tree
- When the timeline matters – use Agent Lanes or Trace Waterfall

### Usage

```tsx
import { AgentFindings, type FindingAgent, type Finding } from "@/components/ui/agent-findings";

export function Run({ agents, findings }: { agents: FindingAgent[]; findings: Finding[] }) {
  return (
    <AgentFindings
      title="Verification"
      agents={agents} // { id, name, model?, avatar?, step?, done, total, status? }
      findings={findings} // { id, agentId, title, severity: "critical" | "warning" | "note", location?, at }
      onOpen={(finding) => openFinding(finding.id)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `FindingAgent[]` |  | One row each: name, current step, checks done of total; status defaults to running until done reaches total |
| findings | `Finding[]` |  | What the agents found, with severity, where and when – the newest come first in the feed |
| title | `string` | `"Verification"` | Heading in the bar |
| rows | `number` | `4` | How many findings the feed shows at most – it grows to that height as they come in |
| now | `number` |  | A clock you control for the “2m” times – without it they follow real time |
| onOpen | `(finding: Finding) => void` |  | A finding was clicked |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the agents and the findings in the feed
- Enter / Space: On an agent: shows only its findings (again: all); on a finding: opens it

### Accessibility

- The feed is a polite live region – new findings are announced as they arrive
- Every severity has a text label for screen readers, not just a color
- Agents are toggle buttons (aria-pressed) for the filter

### Responsive

- Below 480px the check counts and locations drop, so the rows keep one line
- Dark mode built in; colors are CSS variables on .ui-af

### Requirements

- React 19

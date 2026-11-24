# Agent Org Chart (Pro)

An org chart of people and AI agents. People are cards with a photo, a name, a role and the agents they own; agents a card with their twinkling pixel mark, the model with its maker's logo and the logos of the tools they use. Reporting lines run from a hollow dot to an arrowhead, measured from the layout. Status stays quiet – Working shimmers, waiting is amber. An escalation travels up the lines as a light to the person who owns the agent, where it waits with Reply and Approve. Point at a card and its chain up to the top comes forward; click it for the details

- Page: https://www.affectui.com/components/agent-org-chart
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-org-chart.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-org-chart-clean.json` (needs the Pro access key) – lands as `agent-org-chart-clean.tsx`, import from `@/components/ui/agent-org-chart-clean` – its docs: `agent-org-chart-clean.md`
- Import: `@/components/ui/agent-org-chart`

### When to use

- Showing who owns which agents in a team where people and AI agents work side by side
- Making escalations visible: which agent is waiting, and on whom
- An overview page for an agent platform – span of control, sub-agents, what's at work

### When not to use

- How agents call each other during one run – use Agent Tree or Agent Graph
- A list of agents with their live state and controls – use Agent Fleet
- Approving what an agent asks for – use Approval Gates; this only shows that it asked

### Usage

```tsx
import { AgentOrgChart, type OrgNode } from "@/components/ui/agent-org-chart";

const nodes: OrgNode[] = [
  { id: "lena", kind: "person", name: "Lena Hoffmann", role: "Head of Operations", avatar: "/avatars/lena.jpg" },
  { id: "noah", kind: "person", name: "Noah Bennett", role: "Support lead", avatar: "/avatars/noah.jpg", parent: "lena" },
  { id: "triage", kind: "agent", name: "Triage", model: "Haiku 4.5", logo: <ClaudeLogo />, status: "working", parent: "noah",
    tools: [{ name: "Linear", logo: <LinearLogo /> }, { name: "Slack", logo: <SlackLogo /> }] },
  { id: "refunds", kind: "agent", name: "Refunds", model: "Sonnet 4.5", logo: <ClaudeLogo />, status: "idle", parent: "noah",
    tools: [{ name: "Stripe", logo: <StripeLogo /> }] },
];

export function Team() {
  return <AgentOrgChart title="Operations" nodes={nodes} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| nodes | `OrgNode[]` |  | Everyone in the chart – { id, kind, name, parent?, role?, avatar?, model?, logo?, tools?, status?, task?, color? }. kind is person or agent; parent is whom it reports to (a manager, an owner, or the agent a sub-agent runs under) – without it, it sits at the top. People take role and avatar; agents model with its maker's logo (any node, 12px), tools – { name, logo? }, the first three as overlapping white logo tiles, then +N – status (working, waiting or idle), task and color |
| escalations | `OrgEscalation[]` |  | Open escalations – { id, from, to?, label? }. from is the agent; to by default the nearest person above it. A new one travels up the lines; its agent shows waiting, its person an amber strip with the request |
| onApprove | `(escalation: OrgEscalation) => void` |  | Shows Approve on each request in its person's card – remove the escalation to resolve it |
| onReply | `(escalation: OrgEscalation) => void` |  | Shows Reply next to Approve |
| title | `string` |  | The name in the bar – default Org chart |
| className | `string` |  | Extra class on the root – set the color variables on it, e.g. --ui-aoc-p1 |

### Keyboard

- Tab: One stop for the whole chart
- ↑ / ↓: Tree: up to whom it reports, down to the first one under it. List: the card before or after
- ← / →: Tree: the card beside it on the same level. List: up to whom it reports, down to the first one under it
- Home / End: The top or the last card
- Enter / Space: Opens or closes the card's details – with a request in it, focus goes straight to Approve
- Tab: In the details: Reply and Approve
- Esc: Closes the details and goes back to the card

### Accessibility

- The chart is a tree – every card a tree item with its level and place among its siblings
- Every card reads its name, role or model, its status or how many agents the person owns, the tools it uses, and requests waiting
- A new escalation is announced in a polite live region – who asked whom, and what about
- Pointing at or focusing a card brings its chain up to the top forward; the others fade
- Focus rings show for the keyboard only (:focus-visible)

### Motion

- The cards grow in one after another and the lines draw themselves from the hollow dot to the arrowhead
- An escalation travels up the lines: a light runs from the agent to its person, full at its head and fading behind, the line behind it turns amber, and the light keeps running up it while the request is open
- When it arrives, one amber ring goes out from the person's card and a sheen runs over the request in its strip
- An agent's mark twinkles in a diagonal wave while it works, and Working shimmers; the counts in the bar roll
- Pointing at a card lifts it and brings its chain forward; the rest fades back
- With prefers-reduced-motion nothing moves – an escalation simply shows as an amber line and the request

### Responsive

- Wide enough, a tree from the top down; when it doesn't fit, an indented list with the same cards and lines
- The cards keep their size in every state; names shorten with an ellipsis
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep ids stable – a line and an escalation follow them
- An escalation only travels when it is new – give a new id for a new request
- Use stock or real photos for people; without avatar a person shows the full pixel mark
- Give agents the real logos of their model's maker and their tools – Simple Icons work well on the white tiles

### Requirements

- React 19

Related: agent-tree, agent-fleet, approval-gates, agent-graph

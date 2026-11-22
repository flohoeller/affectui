# Handoff Swimlanes (Pro)

Who does what in an agent run, and where the work changes hands – a process diagram with a lane for you, every agent and every tool. Each task is a box in the lane of whoever does it, a handoff an arrow to the next one, an approval a diamond; done boxes are quiet, the running one shimmers in its agent's color, waiting is amber, failed is red, and a light runs along every handoff that's happening now. Click a box, a diamond or a lane and its card opens – an approval waiting for you can be approved right there

- Page: https://www.affectui.com/components/handoff-swimlanes
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/handoff-swimlanes.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/handoff-swimlanes-clean.json` (needs the Pro access key) – lands as `handoff-swimlanes-clean.tsx`, import from `@/components/ui/handoff-swimlanes-clean` – its docs: `handoff-swimlanes-clean.md`
- Import: `@/components/ui/handoff-swimlanes`

### When to use

- Showing who does what in a multi-agent run – and where the work changes hands between agents, tools and people
- Runs with an approval in the middle, where someone has to see what's waiting for them and approve it in place
- Explaining a fixed process – release, onboarding, review – as a diagram people already know from BPMN

### When not to use

- Every message and tool call of one run in order – use Agent Sequence
- Agents spawning sub-agents as a tree – use Agent Tree
- How long each step took on a time axis – use Trace Waterfall

### Usage

```tsx
import { HandoffSwimlanes, type SwimLane, type SwimTask } from "@/components/ui/handoff-swimlanes";

const lanes: SwimLane[] = [
  { id: "you", name: "You", kind: "person", role: "Owner" },
  { id: "planner", name: "Planner", role: "Splits the work" },
  { id: "coder", name: "Coder", role: "Writes code" },
  { id: "vercel", name: "Vercel", kind: "tool", role: "Deploys", logo: <VercelLogo /> },
];

const tasks: SwimTask[] = [
  { id: "start", lane: "you", title: "Ship the billing fix", kind: "start", after: [] },
  { id: "plan", lane: "planner", title: "Split into tasks", status: "done", duration: "14s" },
  { id: "fix", lane: "coder", title: "Fix invoice rounding", status: "active" },
  { id: "approve", lane: "you", title: "Approve deploy", kind: "gate" },
  { id: "deploy", lane: "vercel", title: "Deploy to production" },
  { id: "end", lane: "you", title: "Shipped", kind: "end" },
];

export function Run() {
  return <HandoffSwimlanes title="Ship the billing fix" lanes={lanes} tasks={tasks} onApprove={(t) => approve(t.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| lanes | `SwimLane[]` |  | One row per participant, top to bottom – { id, name, kind?, role?, logo?, color?, description? } |
| kind | `"person" \| "agent" \| "tool"` |  | A person gets the full pixel mark in ink, an agent its own pixel mark in its color, a tool its logo or a grey mark |
| tasks | `SwimTask[]` |  | Everything that happens – { id, lane, title, status?, kind?, after?, duration?, detail? }, placed in the lane named by lane |
| status | `"queued" \| "active" \| "waiting" \| "done" \| "failed" \| "skipped"` |  | Queued by default – running shimmers in its agent's color, waiting is amber, failed red |
| kind (task) | `"task" \| "gate" \| "start" \| "end"` |  | A box, an approval diamond, or the run's start and end circles |
| after | `string[]` |  | The tasks that hand over to this one – by default the one before it in the list; [] starts a new branch |
| title | `string` |  | The heading – "Handoffs" by default – and the section's accessible name |
| onSelect | `(task \| null) => void` |  | A box's card opened or closed |
| onApprove / onReject | `(task) => void` |  | Show Approve and Reject in the card of a gate that's waiting |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Accessibility

- Every lane, box, diamond and circle is a button with aria-expanded – Enter or Space opens its card
- A box reads as its title, its lane and its status – "Fix invoice rounding – Coder, Running"
- Tab goes through the lane names, then the boxes column by column, top to bottom
- A card opened with the keyboard takes focus – on a waiting approval straight to Approve
- Esc closes a card from anywhere and puts focus back on what opened it; so do Approve and Reject
- The run's state – Running, Waiting for you, Done, Failed – is announced as it changes
- The lines, dots and lights are decoration and hidden from screen readers – each card says where the work came from and goes to
- A focus ring shows only for the keyboard
- The classic style has a rounder card with a hairline border, rounder boxes, pill tags and buttons and firmer type – the same behavior as the clean one

### Motion

- On first view the boxes settle in and the lines draw themselves column by column
- A short light runs along every handoff that's happening now – full at its head, fading out behind it, in the receiving agent's color or amber towards an approval
- The running box shimmers and its agent's mark twinkles; a waiting approval breathes softly
- Reduced motion turns all of it off – the states simply change

### Responsive

- Fills its container's width – spare room spreads over the columns
- Short of room the gaps narrow first, then the boxes; still too wide, the whole diagram scales down to fit – it never scrolls sideways
- Below 520px the lanes show only their marks; the name is in the lane's card
- Titles and lane names end in … – the full text is in the card; Arabic and other scripts read in their own direction
- Tasks in a lane that doesn't exist, handovers from ids that don't exist and repeated ids are left out; a loop is cut where it closes
- Lanes without any tasks read Nothing to hand over yet; no lanes at all the same
- Cards open below what you clicked, above it near the bottom of the screen, and never leave the component's width
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Keep task titles to a few words – the detail goes in detail
- One lane per participant; a person working with several agents gets a lane per agent
- Use after for parallel work and joins; leave it out for a straight sequence
- Use a gate for every step a person has to approve, and wire onApprove so it can be done in place

### Requirements

- React 19

Related: agent-sequence, agent-tree, agent-handoff, approval-gates

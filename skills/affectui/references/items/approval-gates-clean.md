# Approval Gates, clean style (Pro)

The approval requests of an agent run as a stack of cards – the one to decide now on top with who asks, what exactly and why, the diff or arguments on it; approve, reject or change it first, and it drops into the decided list while the next rises – open ones hold the steps behind them

- Page: https://www.affectui.com/components/approval-gates
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/approval-gates-clean.json` (needs the Pro access key)
- Import: `@/components/ui/approval-gates-clean`

### When to use

- Human-in-the-loop for agent runs: every tool call, file change, sub-agent or message that needs a person before it goes out
- A run that pauses on approvals – who asks, what exactly and why, with the diff or the arguments right on the card
- Reviewing several requests one after another, and seeing afterwards what was approved, changed or rejected

### When not to use

- Setting how much an agent may do on its own – use Autonomy Dial
- Steering a run while it works, without stopping it – use Agent Steering
- Every message and request of many agents in one place – use Agent Inbox

### Usage

```tsx
import { ApprovalGates, type ApprovalGate } from "@/components/ui/approval-gates-clean";

const gates: ApprovalGate[] = [
  {
    id: "migrate",
    agent: "Coder",
    kind: "tool",
    action: "Run the database migration",
    reason: "Changes the production schema",
    status: "approved",
    at: "6m ago",
  },
  {
    id: "prices",
    agent: "Coder",
    kind: "file",
    action: "Change prices in pricing.ts",
    reason: "Changes what customers pay from Monday",
    status: "open",
    at: "1m ago",
    diff: [{ file: "src/billing/pricing.ts", lines: [{ type: "del", text: "pro: { seat: 8 }," }, { type: "add", text: "pro: { seat: 10 }," }] }],
    holds: ["Deploy to production", "Post to #launch"],
  },
];

export function RunApprovals() {
  return <ApprovalGates gates={gates} task="Launch the new pricing page" live onDecide={(id, decision, value) => agent.decide(id, decision, value)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| gates | `ApprovalGate[]` |  | Every gate of the run, in the order they came up – open ones form the stack, the rest the Decided list |
| task | `string` |  | What the run is about – shown muted next to the title |
| live | `boolean` | `false` | The run is still going: with nothing open it reads Running, and new requests slide in behind the stack |
| onDecide | `(id, decision: "approved" \| "edited" \| "rejected", value?: string) => void` |  | A gate was decided – with edited, value is the changed input, or for a file change what should change |
| title | `string` | `"Approvals"` | Heading of the block on top |
| className | `string` |  | Extra class on the root |
| ApprovalGate | `{ id, agent, avatar?, kind, action, reason, status, at?, input?, diff?, files?, context?, holds?, note? }` |  | kind: "tool" | "file" | "agent" | "message"; status: "open" | "approved" | "edited" | "rejected"; input – the arguments, prompt or message; diff – lines per file; context – the steps before it; holds – the steps that wait for it; note – what the person changed or said |

### Keyboard

- ← / →: In the stack: the previous and next open request – the focus moves to its Approve
- Tab: Through the card on top – its data scrolls with the arrow keys – to Edit, Reject and Approve
- ⌘ / Enter: While editing: approve with your changes
- Esc: While editing: back without changes – the focus returns to Edit
- Enter / Space: On a decided row: open or close it

### Accessibility

- The stack is a group that says how many requests wait and which one is on top; after a decision, focus moves on to the next card's Approve
- Every decision is announced politely – what was decided and how many requests are left
- Diff lines say Added and Removed for screen readers; status is never color alone – Blocking, Approved and Stopped the run are words

### Motion

- The open requests lie like a stack of toasts – a decided card drops out towards the list, the next one rises; a rejected one shakes once first
- A request that comes in while you decide slides in behind the stack
- The stack keeps the height of its tallest card, so Holds and Decided below never move
- With prefers-reduced-motion everything simply appears

### Responsive

- No layer of its own around it – the block, the cards and the list share one width (--ui-gatec-w, 560px) and sit straight in your panel
- Narrow, the numbers wrap onto two rows and the decided rows drop the agent's name
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Add a gate as open the moment the agent asks, with holds for the steps that wait on it – then move it to approved, edited or rejected
- Never remove a decided gate; a rejected one stays as the point where the run stopped
- Keep action to what exactly happens ("Email 1,284 trial users") and reason to why it needs a person, in one line
- How far the cards behind peek out is --ui-gatec-peek, how much smaller each is --ui-gatec-shrink

### Requirements

- React 19

Related: autonomy-dial, agent-steering, agent-inbox, agent-checkpoints

# Root Cause Tree, clean style (Pro)

How an agent finds out why a run failed, as a fault tree – it checks one hypothesis after another, rules some out, confirms the cause, and the way up to the failure lights up

- Page: https://www.affectui.com/components/root-cause-tree
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/root-cause-tree-clean.json` (needs the Pro access key)
- Import: `@/components/ui/root-cause-tree-clean`

### When to use

- Showing how an agent debugs a failed run – every hypothesis it has, which it ruled out and which turned out to be the cause
- Postmortems for agent runs: the failure on top, the way down to what really broke, with the proof for each step
- Anywhere causes combine – an OR where one is enough, an AND where only several together break it

### When not to use

- Who started whom in a run – use Agent Tree
- Rewinding a run to an earlier point – use Agent Checkpoints
- A plain list of findings without causes – use Agent Findings

### Usage

```tsx
import { RootCauseTree, type Cause } from "@/components/ui/root-cause-tree-clean";

const failure: Cause & { detail?: string } = {
  id: "failure",
  title: "Checkout tests failing",
  detail: "4 of 12",
  children: [
    { id: "stripe", title: "Stripe API errors", status: "ruled-out", verdict: "Every call came back 200." },
    {
      id: "coupon",
      title: "Coupon not applied",
      gate: "and",
      status: "confirmed",
      children: [
        { id: "percent", title: "Discount sent as amount", status: "confirmed", evidence: { kind: "Diff", content: "- amount_off\n+ percent_off" } },
        { id: "recompute", title: "Total recomputed after", status: "checking" },
      ],
    },
  ],
};

export function Investigation() {
  return <RootCauseTree failure={failure} onAction={(cause, action) => agent.run(action, cause.id)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| failure | `Cause & { detail?: string }` |  | The failure on top – its children are the first hypotheses; detail is a short line next to its badge, e.g. "4 of 12" |
| children | `Cause[]` |  | Per cause: { id, title, icon?, files?, gate?, status?, verdict?, evidence?, at?, children? } – the hypotheses under it, as deep as you need |
| icon | `ReactNode` |  | Per cause: a small mark before the title, e.g. the logo of the tool or service it's about – it turns gray when ruled out |
| files | `string[]` |  | Per cause: the files it touches – the first shows as a chip on the card, the rest as "+2"; the evidence card lists them all with their full path |
| gate | `"or" \| "and"` | `"or"` | Per cause, for its children: or – one of them is enough; and – they only cause it together |
| status | `"open" \| "checking" \| "ruled-out" \| "confirmed"` | `"open"` | Per cause – a confirmed one without children is a root cause and lights the way up |
| verdict | `string` |  | Per cause: why it was ruled out or confirmed, in a sentence – shown with its evidence |
| evidence | `{ kind, source?, content }` |  | Per cause: the proof – kind is its label ("Log", "Diff", "Tool call"), content the lines, shown as code |
| onAction | `(cause, action: "fix" \| "retry") => void` |  | Fix it or Retry from here was pressed on a root cause – without it, the evidence is read only |
| formatTime | `(ms: number) => string` | `0:42` | Formats when a cause was checked (at) |
| title | `string` | `"Root cause"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Up to the parent, down to the first child – narrow, the previous and next row
- ← / →: Along the row, from one branch into the next – narrow, out to the parent and in to the first child
- Home / End: The failure on top, the last hypothesis
- Enter / Space: Shows that cause's evidence; again goes back
- Tab: From the tree on to the evidence – its code scrolls with the arrow keys – and Fix it / Retry from here
- Esc: Back to what the agent works on

### Accessibility

- The hypotheses are a tree with one tab stop; every card says its title, how it stands and, for a split, whether any or all of the ones below cause it
- The evidence under the tree is announced politely when it changes
- Status is never color alone: ruled out, confirmed and root cause are words, and ruled-out lines are dashed

### Motion

- The hypothesis being checked shimmers; one that's ruled out fades back flat with a dashed line, but stays
- The evidence card grows and shrinks with what's in it – short while there's nothing to show, easing to its new height
- When the root cause is confirmed, the way up to the failure draws itself in blue, from the cause up, one step after the other
- With prefers-reduced-motion everything simply appears

### Responsive

- Every card has a fixed height, so nothing moves when a hypothesis is checked, ruled out or confirmed; the failure's card fits its own title, the hypotheses all share one width – as wide as their longest title needs, growing into spare room – and a title too long for the room ends in “…”, shown whole in the evidence
- The tree lays itself out from its own width; when even the narrowest cards don't fit it becomes an indented list – two rows a card, the gates as chips on the cards
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Add every hypothesis as soon as the agent has it, as open – then move it through checking to ruled-out or confirmed
- Never remove a ruled-out hypothesis; it shows what was checked
- A confirmed cause with children is confirmed only when its gate is met: one child for or, all for and
- The blue of the way up is --ui-rctc-path; how far what you didn't pick fades is --ui-rctc-dim

### Requirements

- React 19

Related: agent-tree, agent-findings, agent-checkpoints, trace-waterfall

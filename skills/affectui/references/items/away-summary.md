# Away Summary (Pro)

The “While you were away” card for a chat thread – right where you left off: how long you were gone, what needs you, what failed and what's done as a short list with one action per row; Got it folds it into a one-line divider

- Page: https://www.affectui.com/components/away-summary
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/away-summary.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/away-summary-clean.json` (needs the Pro access key) – lands as `away-summary-clean.tsx`, import from `@/components/ui/away-summary-clean` – its docs: `away-summary-clean.md`
- Import: `@/components/ui/away-summary`

### When to use

- Coming back to a chat with an agent that kept working – the card sits in the thread right where you left off
- A short catch-up: what needs you first, then what failed, then what's done, each with one action
- A thread that should stay a thread – Got it folds the card into a one-line divider

### When not to use

- A full overnight recap with a chart and a board of what needs you – use Agent Recap
- Every message and request of many agents in one place – use Agent Inbox
- Approving one step of a run in detail – use Approval Gates

### Usage

```tsx
import { AwaySummary, type AwayItem } from "@/components/ui/away-summary";

const items: AwayItem[] = [
  { id: "ingest", title: "Ingest pipeline", kind: "needs-you", detail: "Waiting on: Which queue – Kafka or SQS?" },
  { id: "billing", title: "Billing sync", kind: "failed", detail: "Failed: rate limit on Stripe" },
  { id: "auth", title: "Auth refactor", kind: "done", detail: "Opened PR #482" },
];

export function Thread() {
  return (
    <>
      {messagesBefore}
      <AwaySummary since={lastSeenAt} items={items} onAction={(id) => openTask(id)} onDismiss={() => markSeen()} />
      {messagesAfter}
    </>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| since | `Date \| number \| string` |  | When the person left – the head reads how long ago (2h 14m), or since 9:40 with timeStyle="clock" |
| items | `AwayItem[]` |  | { id, title, kind, detail?, action? } – what happened, any order; what needs you comes first |
| kind | `"needs-you" \| "failed" \| "done"` |  | Per item – sets the mark, the order and the default action (Decide, Retry, Open) |
| action | `string \| false` |  | Per item – the button's label; false leaves the row without one |
| onAction | `(id, item) => void \| Promise` |  | A row's action was pressed. Return a promise and the button shows it working until it settles |
| onDismiss | `() => void` |  | Got it was pressed – store that the person has seen it |
| collapsed / defaultCollapsed | `boolean` | `false` | Folded into the divider – controlled, or where it starts |
| onCollapsedChange | `(collapsed) => void` |  | Folded or opened from the card or the divider |
| limit | `number` | `5` | Rows before Show N more |
| timeStyle | `"duration" \| "clock"` | `"duration"` | 2h 14m, or since 9:40 |
| now | `Date \| number` |  | Now – defaults to the clock, updated every half minute |
| labels | `Partial<AwaySummaryLabels>` |  | Every word on it – title, counts, actions, Show more, Got it, the divider |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the row actions in list order, then Show more and Got it
- Enter / Space: Runs the focused action; on Got it the card folds and focus moves to the divider; on the divider it opens again
- Esc: Inside the card: fold it – focus lands on the divider, and opening again brings it back to the action you left from (else the first action)
- Enter: On Show more: the rows grow open and focus moves to the first new row's action, so Tab reads on from there; Show less keeps focus on the button

### Accessibility

- A region named "While you were away" with a heading that says how long; the rows are a list
- Every action says which task – "Decide: Ingest pipeline" – and each row says its state in words, never color alone
- Got it and the divider are buttons with aria-expanded; the folded part is inert, so Tab never lands in it
- When an item changes, a polite live region says so – "Ingest pipeline: done. 1 needs you"
- Focus never drops to the page: a working button stays focusable (aria-disabled, not disabled), and when a row loses its button or the card folds from outside, focus moves to the next action or the divider

### Motion

- The mark of what needs you breathes softly – the one thing that moves while you read
- A change swaps the row in place: the new mark pops in, a done tick draws itself, the count rolls up
- Folding and opening slide the height between the card and the divider
- With prefers-reduced-motion everything simply appears

### Responsive

- Rows keep one height in every state, so nothing below moves when something resolves
- Narrow, the counts drop under the title and long titles and details end in … (the full text in a tooltip); on touch screens buttons are 36px tall
- A long action label of your own is capped at about 40% of the card and ends in …, so the task keeps its room; a row without detail centers its mark on the title
- Right-to-left: lines and buttons follow the card's direction, and each title and detail reads in its own direction
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Insert it in the thread at the first message after since, and keep it there – it marks where the person left off
- Keep detail to one line of what happened: Opened PR #482, Waiting on: Which queue?, Failed: rate limit on Stripe
- When a needs-you item is answered, change its kind to done and its detail to the answer – the row stays where it is
- For a full overnight recap with a chart see Agent Recap; this one is the small inline version
- Colors are variables on .ui-aw, e.g. --ui-aw-needs, --ui-aw-done, --ui-aw-failed

### Requirements

- React 19

Related: agent-recap, agent-inbox, approval-gates, decision-inbox

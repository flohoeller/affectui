# Agent Ledger (Pro)

Everything an agent changed in your systems, each change with an undo – before and after per row, and pointing at Undo shows what builds on it: what would be undone too, and what can't be taken back

- Page: https://www.affectui.com/components/agent-ledger
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-ledger.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-ledger-clean.json` (needs the Pro access key) – lands as `agent-ledger-clean.tsx`, import from `@/components/ui/agent-ledger-clean` – its docs: `agent-ledger-clean.md`
- Import: `@/components/ui/agent-ledger`

### When to use

- An agent works in real systems – code, payments, CRM, docs, chat – and people need to see what it changed and take it back
- An audit trail next to a run, with before and after for every change
- Anywhere undo needs to be honest about consequences: what goes with it, and what can't be undone

### When not to use

- Approving a change before it happens – use Approval Card or Review Center
- Where the time of one run goes – use Trace Waterfall
- A single decision the agent can't take alone – use Decision Tree

### Usage

```tsx
import { AgentLedger, type LedgerEntry } from "@/components/ui/agent-ledger";

const entries: LedgerEntry[] = [
  { id: "price", action: "Changed price", target: "Pro plan", system: "Stripe", at: Date.now() - 120000,
    change: ["$29 / month", "$34 / month"] },
  { id: "deals", action: "Updated 212 deals", target: "Renewals in Q4", system: "HubSpot", at: Date.now() - 60000,
    change: ["$29 per seat", "$34 per seat"], dependsOn: ["price"] },
  { id: "email", action: "Sent email", target: "3,812 customers", system: "HubSpot", at: Date.now(),
    detail: "New price and the code LAUNCH20", dependsOn: ["price"], reversible: false },
];

export function Changes() {
  return <AgentLedger entries={entries} agent="Launch agent" onUndo={(ids) => revert(ids)} onRedo={(ids) => reapply(ids)} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| entries | `LedgerEntry[]` |  | { id, action, target?, system, icon?, at, change?, detail?, reversible?, dependsOn? } – every change, any order; newest shows first |
| change | `[before, after]` |  | Per entry – shown as before (struck) → after; or pass detail for a single line |
| dependsOn | `string[]` |  | Per entry – the changes it builds on; undoing one of those undoes this one too, if it can be |
| reversible | `boolean` | `true` | Per entry – false for things that can't be taken back (a sent email, a payout): no Undo, and "Can't undo" when something it builds on is undone |
| agent | `string` |  | Who made the changes, next to the title |
| now | `number` |  | The clock for "2m ago" (epoch ms) – defaults to now, kept fresh |
| undone / defaultUndone | `string[]` |  | Ids of undone changes, controlled or not |
| onUndo / onRedo | `(ids: string[]) => void` |  | The change and its reversible dependents – revert or reapply them |
| pointAt | `string \| null` |  | Lights up a change and what builds on it, as if its Undo were pointed at – for a walkthrough |
| title | `string` | `"Ledger"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the Undo and Redo buttons; focusing Undo shows what goes with it
- Enter / Space: Undoes or redoes the focused change

### Accessibility

- The ledger is an ordered list labelled with its title, newest first
- Undo is labelled with the change and how many changes build on it; Redo with the change
- Before → after is plain text; the arrow is read as "to"

### Motion

- New changes open their row at the top – the panel grows smoothly – and then fade in
- Pointing at Undo lights up the change and everything built on it – "Also undone" in blue, "Can't undo" in amber
- Undo draws a line across each row, down the chain a beat after each other; the rows go quiet and their logos gray
- Rows never change height – the time, Undo, Redo and the flags all share one slot
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query: under 480px the numbers move to a line of their own, the time drops the system's name and Undo / Redo shrink to round icon buttons
- On touch screens Undo and Redo show on every row, in place of the time
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass every change every time – ids keep rows in place, new ids slide in
- at is epoch ms; pass now to drive "2m ago" yourself
- Undo calls onUndo with the ids to revert – actually reverting them in Stripe, GitHub etc. is up to you
- Mark irreversible changes with reversible: false – honesty about what can't be undone is the point
- Colors are variables on .ui-ldg, e.g. --ui-ldg-also-bg / --ui-ldg-kept-bg
- The undo, redo and lock icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: approval-card, review-center, trace-waterfall, decision-tree

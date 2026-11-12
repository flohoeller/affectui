# Review Center, clean style (Pro)

A focused workspace for what your agents want to do – the queue sorted by risk, one item at a time with the shaky spans marked, Approve, Edit, Reject and Skip on single keys, a stamp as each one leaves and the next one rising in

- Page: https://www.affectui.com/components/review-center
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/review-center-clean.json` (needs the Pro access key)
- Import: `@/components/ui/review-center-clean`

### When to use

- Human in the loop at volume: a person signs off what agents produced – code changes, migrations, plans, contract edits, refunds, payments – one item after another
- Code review for agents: a multi-file change as file rows with +/- counts and a unified diff with line numbers, the risky lines flagged with the agent's own note
- When the reviewer has to see why the agent wants something and where it is unsure, not only what it wants
- Review queues with a service level: oldest items and items close to their deadline need to stand out

### When not to use

- A board of background tasks with their status – use Agent Inbox
- A handful of yes/no questions answered in passing – use Decision Inbox
- One action that waits for a go, with a countdown – use Approval Card
- An agent asking for access to a tool or scope – use Permission Request
- An agent stuck on a decision that lays out its options and their consequences – use Decision Tree

### Usage

```tsx
import { ReviewCenter, type ReviewItem } from "@/components/ui/review-center-clean";

const items: ReviewItem[] = [
  {
    id: "refund-4821",
    title: "Refund order #4821 for Maya Chen",
    agent: "Support agent", model: "Sonnet 5.5",
    type: "Refund", risk: "high", confidence: 0.62,
    createdAt: Date.now() - 26 * 60_000,
    reasoning: "Her blender arrived cracked – damaged items are covered within 30 days.",
    fields: [
      // A flagged span: marked in the proposal, its note shows on hover or with F
      { label: "Amount", value: [{ text: "$184.00", note: "Includes $20 express shipping.", source: "Refund policy §4" }] },
      { label: "Order", value: "#4821" },
    ],
    bodyLabel: "Reply to Maya",
    body: "Hi Maya, I'm so sorry your blender arrived cracked …",
  },
];

export function Reviews() {
  return (
    <ReviewCenter
      items={items}
      reviewed={24}
      onDecide={(item, result) => save(item.id, result)} // { decision, reason?, text?, fields? }
      onUndo={(item) => revert(item.id)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `ReviewItem[]` |  | { id, title, agent, model?, icon?, type, risk, confidence, createdAt, reasoning?, fields?, body?, bodyLabel?, format?, sources? } – everything waiting; decided items hide themselves, new ids slide into the queue |
| risk | `"high" \| "medium" \| "low"` |  | Per item – sorts the queue (high first), feeds the High risk filter and shows as a small tag next to the agent (high and medium) |
| confidence | `number` |  | Per item, 0–1 – below lowConfidence the item counts as Unsure |
| fields / body | `ReviewText` |  | Per item – a string, or an array of strings and { text, note, source? } flags; flags are marked and explain themselves on hover, focus or F. Edit (E) works on these two |
| files | `ReviewFile[]` |  | Per item – a code change: { path, added?, removed?, diff?, start? } – a row per file, a unified diff with line numbers and a light syntax tint under the files that have one |
| steps | `ReviewStep[]` |  | Per item – a plan: { title, tool?, icon?, detail? } as numbered steps; a step with a flag gets an amber number |
| format | `"text" \| "code"` | `"text"` | Per item – "code" shows the body as a diff, like a file's |
| onDecide | `(item, result) => void` |  | Approved or rejected – result is { decision, reason?, text?, fields? }; text and fields only when the reviewer edited them |
| onUndo | `(item, result) => void` |  | The last decision was taken back – put the item back if you dropped it from items |
| onSkip | `(item) => void` |  | The reviewer moved on without deciding; the row is marked skipped |
| reviewed | `number` | `0` | How many were reviewed before (e.g. today) – the header counts on from here |
| total | `number` | `reviewed + waiting` | The total in the header |
| sla | `number` | `1800000` | How long an item may wait, in ms – waiting times turn amber at 75% and red past it |
| now | `number` |  | The clock (epoch ms) – defaults to the real one, ticking every 10s |
| lowConfidence | `number` | `0.7` | Below this an item is Unsure |
| reasons | `string[]` | `["Wrong info", "Tone", "Not allowed", "Other"]` | The quick reasons for a rejection, picked with 1–4 |
| order | `"risk" \| "oldest" \| "given"` | `"risk"` | High risk first then oldest, oldest first, or as passed |
| filter / defaultFilter | `"all" \| "high" \| "unsure"` | `"all"` | The queue's filter, controlled or uncontrolled |
| onFilterChange | `(filter) => void` |  | The filter changed |
| ref | `Ref<ReviewCenterHandle>` |  | approve, reject(reason?), edit, setDraft, save, cancel, skip, next, previous, undo, peek(index), select(id) |
| title | `string` | `"Review center"` | Heading of the bar |
| className | `string` |  | Extra class on the root |

### Keyboard

- A: Approves the current item
- E: Edits the proposal in place – Cmd/Ctrl+Enter approves with the edits, Esc cancels
- R: Rejects – then 1–4 picks the reason, Esc cancels
- S: Skips to the next item without deciding
- J / K: Next and previous item (ArrowDown and ArrowUp work too)
- F: Shows the agent's note on the next flagged span
- Z: Undoes the last decision (Cmd/Ctrl+Z too)
- Esc: Closes the reason picker, the editor or a note

### Accessibility

- Shortcuts work while the focus is anywhere inside – a click on plain content keeps them working; buttons carry aria-keyshortcuts
- Every action is a real button; the reason picker is a labelled group
- Queue rows show only the title, the type and the waiting time; as buttons they are labelled with title, type, risk, confidence and waiting time; the current one has aria-current
- Flagged spans are focusable and point to their note with aria-describedby (role tooltip)
- Decisions, skips and undos are announced in a polite live region, with the new count
- When the row or field you were on leaves, the focus moves to the next item instead of getting lost

### Motion

- Calm and quick: a decided row shows a small check or cross where its time was, fades and closes up (about 300ms)
- The decided item fades up a few pixels while the next one follows a beat later from just below – the same soft ease as Trace Waterfall
- The pressed button flashes its decision's tint for a moment; the progress bar glides on
- Items that arrive open their row at their sorted spot with a soft highlight
- J and K slide the item up or down; the agent's note opens with a small scale and fade
- With prefers-reduced-motion everything changes at once

### Responsive

- Built on a container query: wide, the queue sits on the left and the item on the right, in a fixed-height workspace
- Under 640px the queue goes on top, three rows high, the item under it; its box glides to each item's height; buttons share the width
- Under 420px the agent line wraps between its parts instead of cutting them, button icons step aside and the flag counter hides – flags are tapped directly; diffs scroll sideways
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass every waiting item – the component sorts, filters and hides what's decided; keep ids stable
- For code, pass files with a unified diff (git diff output works once split into its files); put a flag on the exact expression that worries the agent, not on a whole line
- Flag only the spans the agent is genuinely unsure about, each with a one-line note and, if you have it, its source
- createdAt is when the item started waiting, not when the agent run started
- If you remove decided items from items in onDecide, add them back in onUndo
- Colors are variables on .ui-rvcc, e.g. --ui-rvcc-flag-bg / --ui-rvcc-flag-edge for the flagged spans; --ui-rvcc-height sets the workspace height
- The icons are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: decision-tree, agent-inbox, decision-inbox, approval-card

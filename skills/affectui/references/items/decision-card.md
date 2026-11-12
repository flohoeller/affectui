# Decision Card (Pro)

An agent's question, asked the way Claude asks one – its own card just above the chat composer: numbered options with one Recommended, Approve / Decline for an approval, preview tiles for a pick, and a last row for your own words; a click or 1–5 answers, Later folds it to one line

- Page: https://www.affectui.com/components/decision-card
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/decision-card.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/decision-card-clean.json` (needs the Pro access key) – lands as `decision-card-clean.tsx`, import from `@/components/ui/decision-card-clean` – its docs: `decision-card-clean.md`
- Import: `@/components/ui/decision-card`

### When to use

- An agent in a chat needs one answer from you before it goes on – which option, approve or not, which variant
- Several tasks wait on you at once: one card with a pager, right where you type
- You want answers by keyboard – 1–5, arrows, Enter – without leaving the chat

### When not to use

- Many open decisions across agents, worked through as a list – use Decision Inbox
- Approving tool calls, file changes or messages with their diff or arguments – use Approval Gates
- Steering a run while it works – use Agent Steering

### Usage

```tsx
import { DecisionCard, type Decision } from "@/components/ui/decision-card";

const decisions: Decision[] = [
  {
    id: "queue",
    task: "Ingest pipeline",
    question: "Which queue should the ingest service use?",
    options: [
      { id: "kafka", title: "Kafka", summary: "A durable log – a day of events to replay", recommended: true },
      { id: "sqs", title: "SQS", summary: "Managed, nothing to run – but no replay" },
      { id: "pg", title: "Postgres queue", summary: "The database you already have" },
    ],
  },
];

export function Chat() {
  const [open, setOpen] = useState(decisions);
  return (
    <>
      <DecisionCard
        decisions={open}
        onDecide={(id, answer) => {
          agent.answer(id, answer);
          setOpen((l) => l.filter((d) => d.id !== id));
        }}
      />
      <Composer />
    </>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| decisions | `Decision[]` |  | The open decisions, oldest first – an answered one leaves the card at once; drop it from the array in onDecide |
| onDecide | `(id: string, answer: DecisionAnswer) => void` |  | An answer: { option } for a row or tile, { text } for your own words, "approve" or "decline" |
| onLater | `(id: string) => void` |  | Later or Esc folded the card to one line |
| defaultFolded | `boolean` | `false` | Start folded to "2 decisions waiting · Show" |
| reveal | `number` |  | Change it to bring the card up – it unfolds, pulses gray once and focuses the selected row |
| labels | `Partial<DecisionCardLabels>` |  | Every text, e.g. needsYou, later, show, recommended, approve, decline, own, waiting(n), of(i, n) |
| className | `string` |  | Extra class on the root |
| Decision | `{ id, question, task?, kind?, options?, facts? }` |  | kind: "decision" (default) | "pick" | "approval"; options: three to five { id, title, summary?, recommended?, preview?, blocks? }; facts: two or three { label, value } for an approval |

### Keyboard

- 1 / – / 5: Answer with that row at once; the next number goes into the field
- Home / End: First or last row
- ↑ / ↓: Move between the rows (← → on tiles); ↓ from the last row goes into the field, ↑ from an empty field back
- Enter / Space: Answer with the row in focus; in the field, Enter sends your own words
- Esc: Later – folds the card to one line

### Accessibility

- The card is a group labelled by the question; the rows are a listbox with one tab stop that moves with the arrows
- Every row says its number key (aria-keyshortcuts); Later says Escape
- Answers and Later are announced politely – what you picked and how many still wait
- Focus rings show only for the keyboard (:focus-visible); the field for your own words gets no ring, only a firmer edge
- After an answer the focus moves to the next decision, the pager arrows keep it while you page, Later moves it to Show and Show back to the row – it never falls back to the page, even when your array drops the decision in focus
- After the last answer the card folds away and can't know your composer: move the focus there yourself in onDecide, e.g. if (open.length === 1) composerRef.current?.focus()

### Motion

- The next decision fades in; after the last answer the card folds away – its height to zero, then gone
- Brought up with reveal, the card pulses gray once
- With prefers-reduced-motion everything simply appears

### Responsive

- A gray layer with the head on it and a white card with the rest – it takes the width of your composer
- Long titles and fact values wrap to a second line, then end in …; summaries and the task stay on one line – nothing leaves the card on phones
- One or two tiles keep the size of three; below 420px the tiles turn into rows
- On touch screens rows are 44px tall and buttons 32px to see, 40px to hit
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Put it right above the chat composer, in the same column – the composer stays for new prompts, the card has its own field
- Keep options to three to five with a one-line summary each; mark at most one recommended
- Remove a decision from the array in onDecide – after the last one the card folds away by itself; then focus the composer

### Requirements

- React 19

Related: decision-inbox, approval-gates, chat-composer, agent-steering

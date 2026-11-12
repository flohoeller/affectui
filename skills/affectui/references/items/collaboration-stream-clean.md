# Collaboration Stream, clean style (Pro)

What agents actually say to each other – a quiet chat where every message shows who it is from and who it is for, handoffs and questions for you tagged, files as chips that open a preview, a card with details under every message, and a composer to name agents with @ or answer a question

- Page: https://www.affectui.com/components/collaboration-stream
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/collaboration-stream-clean.json` (needs the Pro access key)
- Import: `@/components/ui/collaboration-stream-clean`

### When to use

- Showing what the agents of a run say to each other – not just who started whom, but the actual messages, handoffs and questions
- Multi-agent runs where you step in: a question for you is tagged, and you answer it or name an agent with @ right from the composer
- Live runs, where messages come in while the agents work and the stream follows the newest one

### When not to use

- Who started whom, at a glance – use Agent Tree
- What every agent did over time, side by side – use Agent Lanes
- A chat between one person and one assistant – use Chat Composer with your own message list
- Requests that wait for a person across many runs – use Agent Inbox

### Usage

```tsx
import { CollaborationStream, type StreamAgent, type StreamMessage } from "@/components/ui/collaboration-stream-clean";

const agents: StreamAgent[] = [
  { id: "orch", name: "Orchestrator", model: "Opus 5.5" },
  { id: "research", name: "Researcher", model: "Gemini 3.8 Flash" },
];

const messages: StreamMessage[] = [
  { id: "m1", from: "you", to: "orch", kind: "ask", text: "Launch the new pricing page by Friday.", at: "14:02" },
  { id: "m2", from: "orch", to: "research", kind: "spawn", text: "Find out what the others charge per seat." },
  { id: "m3", from: "research", to: "orch", kind: "share", text: "Linear $10, Notion $12, Figma $15 per seat.", at: "14:04",
    replyTo: "m2", attachments: [{ label: "pricing-table.csv" }] },
];

export function RunChat() {
  return <CollaborationStream agents={agents} messages={messages} task="Launch the new pricing page" live />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agents | `StreamAgent[]` |  | { id, name, model?, avatar? } – every agent gets its own pixel mark and color in this order; avatar swaps the mark for a logo |
| messages | `StreamMessage[]` |  | { id, from, to, kind, text, at?, replyTo?, typing?, attachments?, details? } – in the order they were sent; from and to are agent ids, "you" or (to) "all" |
| kind | `"ask" \| "reply" \| "handoff" \| "share" \| "question" \| "spawn"` |  | Per message – a handoff is tagged, a question to you says Needs you, a spawn is a quiet line "X started Y" |
| replyTo | `string` |  | Per message – the id it answers; it shows as a quote unless that message is right above, and a click on the quote jumps there |
| typing | `boolean` |  | Per message – still being written: Writing… shimmers and the sender's mark twinkles |
| attachments | `StreamAttachment[]` |  | Per message – { label, kind?, preview?, meta? } as gray chips; a click opens the preview window. kind is told from the label when left out: "…/" a folder, .csv a table |
| details | `StreamDetails` |  | Per message – { facts?, items? } shown in a card under the message when it's clicked |
| task | `string` |  | What the run is about – part of the stream's label |
| live | `boolean` | `false` | The run is still going – a Live dot, and the stream follows new messages unless you scrolled up |
| selected | `string \| null` |  | Controlled id of the picked message – its details open, the rest fades |
| onSelectedChange | `(id: string \| null) => void` |  | A message was picked or let go |
| focusAgent | `string \| null` |  | Controlled id of the agent whose messages stay – the tabs on top |
| onFocusAgentChange | `(id: string \| null) => void` |  | A tab was picked |
| onSend | `({ text, to, replyTo? }) => void` |  | Shows the composer. to holds the agents named with @ or the one answered, else ["all"] |
| placeholder | `string` | `"Message the agents – @ to name one"` | The composer's placeholder |
| logos | `Record<string, ReactNode>` |  | Names that get their logo in the text, e.g. { Notion: <NotionLogo /> } |
| maxHeight | `number` | `520` | The stream scrolls past this height in px – with a composer it's the fixed height, so the composer never moves |
| title | `string` | `"Agent chat"` | Label of the stream for assistive tech |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: The tabs are one stop, the stream another; then the focused message's Reply and chips, then the composer
- ArrowLeft / ArrowRight: Moves between the agent tabs; Home and End jump to the first and the last
- ArrowUp / ArrowDown: Moves between the messages; Home and End jump to the first and the last
- Enter / Space: Picks the focused message and opens its details, or lets it go
- Esc: Lets go of the picked message or agent; in the composer it drops the reply, in the preview it closes it
- @: In the composer: opens the agents – type to filter, arrows to move, Enter or Tab to name one; the @ button opens the same list without typing anything, a second click closes it
- Enter: In the composer: sends – Shift+Enter starts a new line

### Accessibility

- The stream is a log, announced politely while live; every message is labelled with who wrote it, to whom, when and what
- Roving focus – only one message is in the tab order, so the stream is a single stop
- The agent tabs are toggle buttons with aria-pressed in a labelled toolbar – one tab stop, arrows move; a fade at an edge shows there are more
- Only the focused message's Reply and chips are in the tab order, so a long stream doesn't fill it with buttons
- The @ menu is a listbox tied to the field with aria-expanded; the preview is a modal dialog that keeps focus inside and hands it back to its chip
- Needs you and Handoff are words, not just colors; pixel marks and logos are hidden from assistive tech

### Motion

- New messages come up softly; the sender's pixel mark twinkles in a wave while it writes, and Writing… shimmers
- Picking a message or an agent fades the rest; the details card drops in under the message
- A click on a quote scrolls to the message it answers and lights it up for a moment
- The preview window and the @ menu fade in with a small lift
- With prefers-reduced-motion everything appears at once

### Responsive

- Built on a container query – bubbles hug their words up to 560px and wrap on narrow screens
- The tabs scroll sideways when there are more agents than room
- The preview window fits the component, its content scrolls
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the whole list every time something changes – ids keep messages in place, new ids come in softly
- Append the message onSend gives you yourself (from "you") – the stream doesn't keep its own copy
- A question for you stays tagged until a message from "you" has replyTo set to its id
- For a live run, add the next message with typing: true first, then replace it with the full text
- Colors are variables on .ui-crsc, e.g. --ui-crsc-wait-bg / --ui-crsc-wait-fg for Needs you
- The attachment icons are drawn for affectUI – no icon library needed

### Requirements

- React 19

Related: agent-tree, agent-lanes, agent-inbox, chat-composer, thinking-state

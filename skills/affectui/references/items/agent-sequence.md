# Agent Sequence (Pro)

One agent run as a sequence diagram – a column for you, every agent and every tool, and each message an arrow from one lifeline to the next: calls solid, replies dashed, every label a tag in its line's color, a bar on the lifeline while a participant works, parallel and retried messages in labelled frames; new messages draw themselves across with a light at the tip, and a click on a participant or a message opens its card

- Page: https://www.affectui.com/components/agent-sequence
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/agent-sequence.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/agent-sequence-clean.json` (needs the Pro access key) – lands as `agent-sequence-clean.tsx`, import from `@/components/ui/agent-sequence-clean` – its docs: `agent-sequence-clean.md`
- Import: `@/components/ui/agent-sequence`

### When to use

- Showing who talked to whom in one agent run – you, the agents and the tools they called, message by message
- Debugging a multi-agent run: which call waited on which reply, what ran in parallel, where a retry happened and what failed
- A live view of a run as it happens – every new message draws itself in

### When not to use

- How long each step took on a time axis – use Trace Waterfall
- Many agents over a long stretch of time, lane by lane – use Agent Lanes
- The structure of a crew rather than its messages – use Agent Crew or Agent Tree

### Usage

```tsx
import { AgentSequence, type SeqMessage, type SeqParticipant } from "@/components/ui/agent-sequence";

const participants: SeqParticipant[] = [
  { id: "you", name: "You", kind: "person" },
  { id: "lead", name: "Lead", kind: "agent", model: "Claude Opus" },
  { id: "research", name: "Researcher", kind: "agent", model: "Claude Sonnet" },
  { id: "github", name: "GitHub", kind: "tool", logo: <GitHubLogo /> },
];

const messages: SeqMessage[] = [
  { id: "m1", from: "you", to: "lead", label: "Fix the checkout crash", at: 0 },
  { id: "m2", from: "lead", to: "lead", label: "Plan: find, patch, preview", at: 2_000 },
  { id: "m3", from: "lead", to: "research", label: "Find the cause", at: 3_000 },
  { id: "m4", from: "research", to: "github", label: 'search_code("emptyCart")', at: 5_000 },
  { id: "m5", from: "github", to: "research", label: "3 matches", kind: "reply", replyTo: "m4", at: 6_000 },
  { id: "m6", from: "research", to: "lead", label: "Null total in cart.ts:42", kind: "reply", replyTo: "m3", at: 11_000 },
];

export function Run() {
  return <AgentSequence title="Fix the checkout crash" participants={participants} messages={messages} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| participants | `SeqParticipant[]` |  | A column each, left to right, with a dashed lifeline – a chip on top opens its card |
| SeqParticipant.kind | `"person" \| "agent" \| "tool"` | `"agent"` | A person gets the full pixel mark in the ink color, an agent its own pixel mark – twinkling while it works – a tool its logo |
| SeqParticipant.logo / color | `ReactNode / string` |  | A logo instead of the pixel mark; the agent's color – by default the first agent is blue and the others take the palette in order |
| SeqParticipant.model / description | `string / string` |  | In its card: the model as a tag, and a line on what it does |
| messages | `SeqMessage[]` |  | In order, top to bottom – each new id draws itself across with a light at its tip and lands with a small ripple |
| SeqMessage.kind / replyTo | `"call" \| "reply" / string` | `"call"` | A call is a solid line and the receiver works – a bar on its lifeline – until a reply with its id as replyTo comes back as a dashed line. From and to the same: a loop back to its own lifeline |
| SeqMessage.status | `"failed" \| "waiting"` |  | failed is red with a small cross where it lands; waiting – it needs a person – is amber |
| SeqMessage.at | `number` |  | When it was sent, ms since the run started – shown in the gutter on the left, and used for the timing in the cards |
| SeqMessage.frame | `string` |  | Messages next to each other with the same frame sit in one white box with it as a tag – "par", "retry", "loop ×3" |
| SeqMessage.detail | `string` |  | In its card: what exactly went along – the arguments of a call, a result, an error |
| title | `string` |  | The header's name, with how many work or failed, how many messages and the run's time |
| running | `boolean` | `true` | false once the run is over – open bars stop shimmering and marks stop twinkling |
| times | `boolean` |  | The time gutter – by default there while no message has come in yet and whenever one has a time, so the first one doesn't push the diagram over; false hides it |
| onSelect | `(message \| null) => void` |  | A click or Enter on a message – its card opens; null when it closes |
| formatTime | `(ms) => string` | `m:ss` | Formats the gutter and the cards' times |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Moves through the participants, then into the messages – one stop for all of them
- ↑ / ↓: Walks the messages
- Home / End: The first, the last message
- Enter / Space: Opens or closes a message's card – a participant's opens with Enter or Space on its chip
- Esc: Closes the card – focus goes back to what opened it

### Accessibility

- The messages are an ordered list; each is named with sender, receiver, text, status and time – "Researcher to GitHub: search_code(\"emptyCart\"), 0:05" – and says it opens a dialog
- Participants are buttons; their cards and the messages' cards are dialogs named after them, with a close button reachable by Tab
- A polite live region reads each new message
- Colors never carry meaning alone: replies are dashed, failures say "Failed" and carry a cross, frames say what they are
- Focus rings show for the keyboard only, in light and dark – outside on the chips, inside on the message rows

### Motion

- A new message draws itself across from the sender with a soft light at its tip and lands with a small ripple; its tag rises in
- Each line fades from faint where it leaves to full where it lands, so it reads which way it goes; a loop fades the same way as it turns back
- The receiver's bar grows down its lifeline; a light sweeps down bars that are still open and working agents' marks twinkle
- Cards pop in under a participant, or beside a message's tag
- Reduced motion turns it all off – messages simply appear

### Responsive

- Columns share the width evenly; below about 100px a column (84px on phones) the diagram scrolls sideways instead of squeezing, with a soft edge on the side there's more
- Phones get a narrower time gutter and smaller times; touch screens a bigger target around each participant and the close button
- Rows are fixed, so a new message never moves the ones above it – the diagram only grows down
- Labels are solid tags in their line's color that read over every line and bar they cross; a long one ends in … with the full text on hover and in its card
- Cards float in the top layer and stay inside the diagram – a message's opens on the left when there's no room on the right, or below it on a phone; they follow their anchor on scroll and close once it's scrolled out of the diagram
- An agent talking to itself on the last column gets its text on the left of its lifeline
- Broken data holds: messages to or from someone who isn't a participant are left out, a time that isn't a number shows none, a negative one reads 0:00, runs past an hour widen the gutter for 1:02:05, an empty label draws just the line, and a reply to a call that doesn't exist is still drawn
- Participants are white pills and labels pill-shaped tags, like the rest of the library; frames and cards have soft hairline borders
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give every participant and message a stable id – messages draw in once per id
- Pass messages in the order they happened; set replyTo on replies so the receiver's bar ends and the cards can say how long it took
- Keep labels short – a tool call with its main argument, a result in a few words – and put the rest in detail
- Four to six participants fit 760px comfortably; more scroll sideways
- Colors are --ui-asq-* variables on the root; the first agent is --ui-asq-blue

### Requirements

- React 19

Related: trace-waterfall, agent-lanes, agent-crew, agent-handoff

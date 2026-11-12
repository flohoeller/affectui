# Tool Call Card, clean style (Free)

An agent's tool call in one line – live timer, status and summary, folds open to highlighted arguments and result with copy, retry on errors and a group that sums them up

- Page: https://www.affectui.com/components/tool-call-card
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/tool-call-card-clean.json`
- Import: `@/components/ui/tool-call-card-clean`

### When to use

- Tool and function calls in an agent chat or run log – what was called, with what, and what came back
- Agents that call several tools per turn – wrap them in ToolCallGroup so the answer isn't buried under cards
- Developer-facing views where people need to copy the exact arguments or result to debug

### When not to use

- Plain reasoning with no tool calls – use Thinking State or Thinking Loader
- End users who never care about JSON – show a one-line status instead and keep the details in a log
- Huge payloads (megabytes of JSON) – trim or paginate them first; the card renders the whole string

### Usage

```tsx
import { ToolCallCard, ToolCallGroup } from "@/components/ui/tool-call-card-clean";

export function ToolCalls({ calls }: { calls: ToolCall[] }) {
  return (
    <ToolCallGroup>
      {calls.map((call) => (
        <ToolCallCard
          key={call.id}
          name={call.name}
          summary={call.summary}
          status={call.status}
          args={call.args}
          result={call.result}
          error={call.error}
          startedAt={call.startedAt}
          duration={call.durationMs}
          onRetry={() => retryToolCall(call.id)}
        />
      ))}
    </ToolCallGroup>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` |  | Tool name as the agent calls it, shown in mono – e.g. "search_web" |
| status | `"running" \| "success" \| "error"` |  | Blue spinner with a live timer, a solid blue check with the duration, or a red "Failed" |
| summary | `ReactNode` |  | Short human summary next to the name; truncates with an ellipsis |
| icon | `ReactNode` | `wrench icon` | Icon on the left, drawn in the icon gray without a tile – a 16px stroke SVG fits best |
| args | `unknown` |  | Arguments – objects are pretty-printed and highlighted, JSON strings are parsed; the section is hidden when undefined |
| result | `unknown` |  | What the tool returned – like args; other strings are shown as plain text. While running without a result, "Waiting for result…" is shown |
| error | `string` |  | Error message, shown in the body when status is "error" |
| startedAt | `number` |  | Start time in ms since epoch – the live timer counts from here instead of from when the card turned running |
| duration | `number` |  | Final duration in ms – otherwise the time measured while the card was running |
| defaultOpen | `boolean` | `false` | Start expanded (uncontrolled) |
| open | `boolean` |  | Expanded state (controlled) |
| onOpenChange | `(open: boolean) => void` |  | Called when the header is toggled |
| openOnError | `boolean` | `true` | Opens the card when the call fails and closes it on the next run, unless someone toggled it by hand (uncontrolled only) |
| onRetry | `() => void` |  | Shows a Retry button next to the error message |
| maxCodeHeight | `number` | `220` | Height in px after which arguments and result are capped with a fade and a "Show all" toggle |
| className | `string` |  | Extra class on the root |
| ToolCallGroup · children | `ToolCallCard elements` |  | The cards – the group reads their icon, status and duration props for its header, so pass them as direct children |
| ToolCallGroup · label | `string` | `"Used N tools"` | Header label once nothing is running |
| ToolCallGroup · runningLabel | `string` | `"Using tools…"` | Shimmering header label while any card is running |
| ToolCallGroup · duration | `number` |  | Total in ms – otherwise the sum of the cards' duration props, or the time measured while any card was running |
| ToolCallGroup · defaultOpen / open / onOpenChange | `boolean / boolean / (open) => void` | `false` | Expanded state, uncontrolled or controlled |
| ToolCallGroup · className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Moves through the headers, copy buttons, Show all and Retry; content of closed cards is skipped
- Enter / Space: On a header: expands or collapses the card or the group

### Accessibility

- Headers are real buttons with aria-expanded and aria-controls pointing at the body
- Closed bodies are inert, so they can't be focused or read until opened
- A polite live region per card announces "search_web running", "finished" or "failed: …"; the group announces "Using tools…" and "Used 3 tools"
- Copy buttons are labelled "Copy arguments" / "Copy result" and switch to "Copied"; icons are aria-hidden
- Errors use text and an icon, not only red

### Motion

- The body grows with grid-template-rows 0fr → 1fr and fades in; the chevron turns
- Status changes blur in; the blue check pops in and draws itself; the spinner turns while running
- The small white copy button morphs into a blue check for 1.4s; Show all opens the capped block to its full height
- In the group, new tool icons pop into the stack of small white tiles and "Using tools…" shimmers while anything runs
- With prefers-reduced-motion everything switches instantly and the shimmer is off

### Responsive

- Fills its container; name and summary truncate with an ellipsis, the status never wraps – works down to ~320px
- Each call is one white card with hairline shadows; tighter padding below 360px and taller headers on touch screens
- Code wraps long lines instead of scrolling sideways
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Map your agent's tool-call events 1:1: status running on the call, success or error on the result; pass startedAt from the event for an exact timer
- Write summary in past tense when done ("Searched…") and present progressive while running ("Searching…")
- Pass args and result as objects – stringify nothing yourself; redact secrets before they reach the card
- Wrap all calls of one assistant turn in a single ToolCallGroup and keep cards as direct children

### Requirements

- React 19

Related: thinking-loader, thinking-state, ai-answer

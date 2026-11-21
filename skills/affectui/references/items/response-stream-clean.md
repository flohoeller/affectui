# Response Stream, clean style (Pro)

One agent answer through every state it goes through – words streaming in, stopped and continued from the exact word, failed and retried from there, done – with steer and queued messages above it

- Page: https://www.affectui.com/components/response-stream
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/response-stream-clean.json` (needs the Pro access key)
- Import: `@/components/ui/response-stream-clean`

### When to use

- An agent chat where the answer itself shows every state: writing, stopped, failed, done
- Letting people stop an answer, pick it up again from the exact word, or retry after an error without starting over
- Showing messages sent while it writes – a steer that bends the answer now, or a queued one that becomes the next answer

### When not to use

- The whole composer with model, mode and permissions – use Run Controls
- Only the thinking before an answer – use Thinking State

### Usage

```tsx
import { ResponseStream } from "@/components/ui/response-stream-clean";

export function Answer({ text, status }) {
  return (
    <ResponseStream
      text={text}
      status={status} // "streaming" | "stopped" | "failed" | "done"
      agent={{ id: "atlas", name: "Atlas" }}
      onStop={() => stream.abort()}
      onContinue={() => stream.resume()}
      onRetry={() => stream.retry()}
      onDismiss={() => removeAnswer()}
      meta={{ tokens: 182, ms: 6400 }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string` |  | The answer so far – keep appending while it streams. A trailing half word waits until it is whole; ``` fences become code blocks |
| status | `"streaming" \| "stopped" \| "failed" \| "done"` |  | Which state the answer is in – the footer, caret and agent mark follow it |
| error | `string` |  | What went wrong, in one sentence – shown when failed |
| steer | `ResponseSteer[]` |  | { id, text, kind: "steer" | "queued" } – chips above the answer; the first queued one reads Next; more than three fold behind “+ n more” |
| bends | `ResponseBend[]` |  | { at, text? } – character offsets where a steer bent the answer; a quiet divider there |
| agent | `{ id, name, color? }` | `Assistant` | Who answers – the pixel mark is drawn from the id |
| meta | `{ tokens?, ms? }` |  | Time and tokens in the done footer |
| onStop | `() => void` |  | Stop button and Esc while it streams |
| onContinue | `() => void` |  | Continue after a stop – keep appending to the same text |
| onRetry | `() => void` |  | Retry after a failure – picks up from the text so far |
| onDismiss | `() => void` |  | Called once the stopped answer has faded out |
| onRemoveSteer | `(id: string) => void` |  | The × on a chip |
| onCopy | `(text: string) => void` |  | Copy in the done footer – the text is also put on the clipboard |
| onRegenerate | `() => void` |  | Regenerate in the done footer – the button shows only with it |
| escToStop | `boolean` | `true` | Esc stops a streaming answer, unless focus is in a text field |
| className | `string` |  | Extra class on the answer |

### Keyboard

- Esc: Stop the answer while it streams
- Tab: Move through the footer actions and the chips' remove buttons
- Enter / Space: Press Continue, Retry, Dismiss, Copy or Regenerate

### Accessibility

- New text is announced politely in whole sentences, never word by word
- Each status change – stopped, failed with its reason, finished – is announced once
- While it writes the answer is marked busy; the steer divider is a separator with what it was steered with

### Motion

- The newest words come in from a light blur in about 180ms; the caret is a thin bar with a soft glow that breathes
- The agent's pixel mark twinkles in a diagonal wave while it writes and rests otherwise; Dismiss fades the answer out
- Reduced motion shows words without the blur and a still caret

### Responsive

- The answer only grows downwards; the footer is one row that keeps its height and never shifts sideways
- Below 360px the indent goes and the footer may wrap; the error is its own line under the text; long words and URLs wrap, code scrolls sideways
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: run-controls, agent-steering, agent-queue, thinking-state, message-actions

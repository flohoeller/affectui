# Thinking Loader, clean style (Free)

A small working pill for AI replies – an eight-ray spinner and a shimmering label that rolls through phases and settles on a check

- Page: https://www.affectui.com/components/thinking-loader
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/thinking-loader-clean.json`
- Import: `@/components/ui/thinking-loader-clean`

### When to use

- The wait between sending a prompt and the first streamed token – one line that says what the model is doing
- Agent and pipeline steps with real labels: searching, reading, running a tool, writing
- Inline in a chat bubble or next to a button where a full panel would be too much

### When not to use

- When people should see the sources and every step – use Thinking State
- Page or data loading with no phases – a skeleton or a plain spinner reads calmer
- Waits under half a second – the loader would only flash

### Usage

```tsx
import { ThinkingLoader } from "@/components/ui/thinking-loader-clean";

export function AssistantPending({ streaming }: { streaming: boolean }) {
  return (
    <ThinkingLoader
      phases={["Thinking", "Searching the web", "Reading sources", "Writing response"]}
      interval={2200}
      done={streaming}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| phases | `string[]` | `["Thinking", "Searching the web", "Reading sources", "Writing response"]` | Labels to walk through, one after another |
| interval | `number` | `2200` | Time per phase in ms when the phase isn't controlled |
| phase | `number` |  | Controlled index into phases – the timer stops and the loader shows this phase |
| loop | `boolean` | `false` | Start over after the last phase instead of holding it |
| done | `boolean` | `false` | Turns the spinner into a check and the label into doneLabel; setting it back to false starts over |
| doneLabel | `string \| ((seconds: number) => string)` | `(s) => `Thought for ${s}s`` | Label once done – a function gets the seconds since the loader started |
| size | `"sm" \| "md"` | `"md"` | 26 or 32px tall – 12 or 13px label |
| variant | `"pill" \| "plain"` | `"pill"` | A white chip with hairline shadows, or just the spinner and the label |
| className | `string` |  | Extra class on the root |

### Accessibility

- role="status" with aria-live="polite": screen readers hear each new phase and the done label once
- The spinner, the check and the label rolling out are aria-hidden; the shimmer copy has empty alt text, so labels are read once

### Motion

- Eight thin accent-blue rays fade one after another, so the spinner turns without rotating
- A darker band sweeps through the gray label while it works
- On a new phase the old label rolls up and blurs out, the new one rolls in, and the chip glides to its new width
- Done: the spinner shrinks away while the check grows in and draws itself; the label stops shimmering
- With prefers-reduced-motion the labels switch instantly and the spinner and shimmer stand still

### Responsive

- Sizes to its label; long phases stay on one line, so keep them short (two to four words)
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Map phases to real events (tool calls, retrieval, first token) with the phase prop when you have them; the timer is a fallback
- Set done when the first token arrives and swap the loader for the streamed message shortly after

### Requirements

- React 19

Related: thinking-state, ai-answer, chat-composer

# Code Block, clean style (Free)

Code to read and copy – a header with the file name or language and a copy button, line numbers, highlighted lines, long lines that scroll inside and a small built-in colorizer

- Page: https://www.affectui.com/components/code-block
- Section: Components · Text
- Install: `npx shadcn@latest add https://www.affectui.com/r/code-block-clean.json`
- Import: `@/components/ui/code-block-clean`

### When to use

- Showing code someone will copy: an install command, a config file, an API example, a snippet an agent wrote
- Tool inputs and outputs, logs or JSON payloads that need to keep their exact spacing
- Pointing at a few lines – highlightLines marks them, showLineNumbers lets people refer to them

### When not to use

- A single name or value inside a sentence – use an inline <code> or a Kbd chip for shortcuts
- A secret someone copies once, like an API key – a read-only Text Field with a copy button fits better
- Comparing two versions of code – use the Inline Diff
- A whole tool call with its arguments and result – use the Tool Call Card

### Usage

```tsx
import { CodeBlock } from "@/components/ui/code-block-clean";

export function ReviewerConfig() {
  return (
    <CodeBlock
      language="ts"
      filename="agents/reviewer.ts"
      showLineNumbers
      highlightLines={[8, 9]}
      code={`import { defineAgent } from "@acme/agents";

export const reviewer = defineAgent({
  name: "Code reviewer",
  model: "claude-opus",
  tools: ["github", "linear"],
  // Ask before anything leaves the repo
  approval: { required: true, timeout: "2h" },
  maxSteps: 24,
});`}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| code | `string` |  | Required. The code – copied exactly as given; one trailing newline isn't shown as an empty line |
| language | `string` |  | ts, tsx, js, jsx, json, bash, sh, python … – TypeScript / JavaScript, JSON, Bash and Python are colored, anything else is plain text. Named in the header when there is no filename |
| filename | `string` |  | Shown in the header instead of the language; long names end in … with the full name as a tooltip |
| showLineNumbers | `boolean` | `false` | Numbers in front of every line – they stay in place while long lines scroll sideways and are left out when code is selected |
| highlightLines | `number[]` |  | Lines to mark, counted from 1 – a light tint with a thin edge on the left |
| wrap | `boolean` | `false` | Long lines wrap instead of scrolling sideways |
| maxHeight | `number \| string` |  | After this height the code scrolls inside, e.g. 320 or "40vh" |
| copyable | `boolean` | `true` | The copy button; without it and without a filename or language there is no header |
| onCopy | `(code: string) => void` |  | Called after the code was copied, e.g. to show a toast |
| className / style | `string / CSSProperties` |  | On the root <figure> |

### Keyboard

- Tab: Moves to the copy button, then into the code when it scrolls
- Enter / Space: Copies the code (on the copy button)
- ← / → / ↑ / ↓: Scroll the code when it's focused

### Accessibility

- A <figure> with the header as its <figcaption>, the code in <pre><code>
- The copy button is named Copy code, then Copied; a polite status also announces Copied
- When the code scrolls it becomes a focusable region, so keyboard users can scroll it; when it fits it's not a tab stop
- Line numbers are hidden from screen readers and can't be selected, so copying by hand gives clean code
- Code always runs left to right, also in right-to-left pages; the file name follows its own direction
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- On copy the copy glyph blurs away into a check, which turns back after 1.4s
- With prefers-reduced-motion it swaps instantly

### Responsive

- Never wider than its container: long lines scroll inside the card (or wrap with wrap) instead of stretching the page
- Touch screens get a bigger hit area around the copy button
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: tool-call-card, inline-diff, ai-answer, text-field

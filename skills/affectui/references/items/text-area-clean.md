# Text Area, clean style (Free)

The multi-line twin of the Text Field – grows with the text, a character count, a button for more room and ⌘ Enter to send

- Page: https://www.affectui.com/components/text-area
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/text-area-clean.json`
- Import: `@/components/ui/text-area-clean`

### When to use

- Anything longer than a line in a form: descriptions, notes, bios, feedback, instructions or context for an assistant
- Settings and creation dialogs next to Text Fields – same label, hint, error and focus, so a form reads as one

### When not to use

- A single line – names, emails, URLs – use the Text Field
- Writing to an assistant or a person with send, attachments or a model picker – use the Chat Composer

### Usage

```tsx
import { useState } from "react";
import { TextArea } from "@/components/ui/text-area-clean";

export function CompanyContext({ onSave }: { onSave: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <TextArea
      label="Company context"
      hint="Added to every chat in this workspace."
      value={text}
      onChange={(e) => setText(e.target.value)}
      maxLength={2000}
      counter
      minRows={3}
      maxRows={8}
      expandable
      onSubmitShortcut={onSave}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `ReactNode` |  | Shown above the field; clicking it focuses the textarea |
| hint | `ReactNode` |  | A quiet line under the field – the error takes its place while there is one |
| error | `ReactNode` |  | Marks the field invalid (red edge, aria-invalid) and shows the message where the hint was |
| optional | `boolean` | `false` | Adds "Optional" next to the label |
| counter | `boolean` | `false` | Shows "120/2,000" under the field, red once a prefilled value is over the limit; needs maxLength |
| minRows | `number` | `3` | Height when empty, in lines |
| maxRows | `number` | `10` | It grows with the text up to this many lines, then scrolls inside |
| expandable | `boolean` | `false` | A small button in the top corner that gives the field more room – and back |
| expandedRows | `number` | `16` | Lines while expanded |
| expanded | `boolean` |  | Controls the expanded state from outside; pair with onExpandedChange |
| onExpandedChange | `(expanded: boolean) => void` |  | Called when the button gives more or less room |
| onSubmitShortcut | `(value: string) => void` |  | ⌘/Ctrl+Enter – save or send without reaching for the mouse; Enter alone still makes a new line |
| inputClassName | `string` |  | Extra class on the textarea itself, e.g. a monospace font for prompts |
| className | `string` |  | Extra class on the wrapper |
| ...textarea props | `ComponentProps<"textarea">` |  | Everything else – value, defaultValue, onChange, name, placeholder, required, disabled, readOnly, maxLength, ref – goes to the textarea |

### Keyboard

- Enter: A new line
- ⌘ / Enter: Calls onSubmitShortcut (Ctrl+Enter on Windows and Linux)
- Tab: Moves on to the More room button, then out of the field

### Accessibility

- A real <textarea> with a <label> tied to it – works with forms, autofill and screen readers
- The hint, the error and the count are linked with aria-describedby; an error sets aria-invalid and is announced politely
- The More room button reports its state with aria-pressed and points at the field with aria-controls; the shortcut is listed in aria-keyshortcuts
- Without a label, a text placeholder becomes the field's accessible name – better still, pass aria-label

### Motion

- No focus ring: the hairline edge firms up on hover and a little more on focus
- The field grows line by line as you type, without animation – it never lags behind the caret
- More room glides the height open and closed; the corner icon swaps out of a short blur
- An error nudges the field once and its message slides in where the hint was – nothing below moves
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container; it measures again when its width changes, because the text wraps differently
- On touch screens it uses 16px text, so iOS doesn't zoom in on focus, and the corner button grows to 32px
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: text-field, chat-composer, button, stepper-form

# Prompt Library (Pro)

Saved prompt templates with variables – type straight into the sentence, watch the finished prompt assemble below, and use it once every variable is filled

- Page: https://www.affectui.com/components/prompt-library
- Section: Components · Inputs
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/prompt-library.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/prompt-library-clean.json` (needs the Pro access key) – lands as `prompt-library-clean.tsx`, import from `@/components/ui/prompt-library-clean` – its docs: `prompt-library-clean.md`
- Import: `@/components/ui/prompt-library`

### When to use

- AI products where people reuse the same prompts with small changes – summaries, release notes, outreach, debugging
- Next to a chat composer, as the place to pick a saved prompt, fill in the blanks and send it
- Team prompt libraries where the template stays fixed and only a few words change per use

### When not to use

- Free writing – a plain composer is faster when nothing repeats
- Long templates with many variables – past about six fields a form with labels reads better than a sentence
- Choosing a command or action – use Command Menu

### Usage

```tsx
import { PromptLibrary } from "@/components/ui/prompt-library";

export function Prompts() {
  return (
    <PromptLibrary
      templates={[
        {
          id: "meeting",
          title: "Summarize a meeting",
          category: "Notes",
          body: "Summarize the meeting below for {audience} in under {length}.",
          variables: { length: { default: "150 words" } },
        },
        {
          id: "error",
          title: "Explain an error",
          category: "Debug",
          body: "Explain this {language} error in plain words: {error}.",
        },
      ]}
      onUse={(prompt) => send(prompt)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| templates | `PromptTemplate[]` |  | { id, title, category?, tone?, body, variables? } – body holds the variables in curly braces, e.g. {audience}; variables maps a name to { description?, default? } |
| value | `string` |  | Id of the chosen template (controlled) |
| defaultValue | `string` |  | Id chosen at first when uncontrolled – the first template by default |
| onSelect | `(id: string) => void` |  | Called when another template is chosen |
| onUse | `(prompt: string, template: PromptTemplate, values: Record<string, string>) => void` |  | Called with the finished prompt when Use is pressed – only possible once every variable is filled |
| onCopy | `(prompt: string) => void` |  | Called after the prompt was copied to the clipboard |
| title | `string` | `"Prompts"` | Heading above the list |
| useLabel | `string` | `"Use prompt"` | Label of the use button |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↓: From the search field into the list
- ↑ / ↓ / Home / End: Move through the list – the template opens as you go
- Esc: Clears the search
- Tab: Through the variable fields, then Copy and Use
- Enter: In a variable field: jumps to the next empty one, or uses the prompt once all are filled

### Accessibility

- A group named by the list's title; the templates are a listbox with options and aria-selected, only the chosen one is in the tab order
- Every variable is a real text field labelled with its name and description
- Use stays focusable while not ready (aria-disabled) and the tray says how many variables are missing
- A polite live region announces when all variables are filled, when the prompt was copied and when it was used
- The outgoing template that fades out during a switch is inert and hidden from screen readers

### Motion

- The highlight slides along the list to the chosen template while the content crossfades – the old one fades out underneath
- The part you type into lights up in the field and in the preview, then fades back
- The token estimate on the tray rolls to its new value as you type
- Use pulses once when the last variable gets filled; Copy turns into a check for a moment
- With prefers-reduced-motion everything switches without movement

### Responsive

- Fills its container up to 640px. Below 540px the list moves on top of the template; below 360px Copy keeps only its icon
- Fields grow with what you type and never get wider than the line
- Touch screens: taller list rows, fields and buttons
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Variables are written as {name} with letters, digits, - or _; the same name used twice is one field
- Values are kept per template inside the card, so switching back and forth keeps what was typed
- The token number is an estimate (about four characters per token) – pass the prompt to your tokenizer when it has to be exact
- Category colors follow the order the categories appear; set tone on a template to pick one

### Requirements

- React 19

Related: chat-composer, command-menu, writing-assistant

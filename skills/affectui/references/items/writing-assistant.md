# Writing Assistant (Pro)

AI chat card with a soft gradient glow, suggestions, streaming replies and live voice dictation

- Page: https://www.affectui.com/components/writing-assistant
- Section: Components · Chat
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/writing-assistant.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/writing-assistant-clean.json` (needs the Pro access key) – lands as `writing-assistant-clean.tsx`, import from `@/components/ui/writing-assistant-clean` – its docs: `writing-assistant-clean.md`
- Import: `@/components/ui/writing-assistant`

### When to use

- A small AI helper inside an editor, CRM or sidebar – rewrite, shorten, translate or draft
- Landing pages that should show an assistant you can actually try, including voice input

### When not to use

- Long conversations with files, tools and model settings – use the Chat Composer or the AI Chat / Start screen
- When you can't send voice to the browser's speech service – set speech="simulate" or hide the mic

### Usage

```tsx
import { WritingAssistant } from "@/components/ui/writing-assistant";

export function Helper() {
  return (
    <WritingAssistant
      name="Quill"
      tagline="Your writing companion."
      respond={async (message) => {
        const res = await fetch("/api/write", { method: "POST", body: JSON.stringify({ message }) });
        return (await res.json()).text;
      }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` | `"Quill"` | Assistant name on top |
| tagline | `string` | `"Your writing companion."` | Line under the name |
| greeting | `string` | `"What should we write?"` | Big line on the welcome screen |
| suggestions | `string[]` |  | Chips that send themselves as a message |
| placeholder | `string` | `"Ask anything…"` | Placeholder of the prompt field |
| respond | `(message) => string \| Promise<string>` |  | Your answer for a message; a sample writer is used by default |
| speech | `"auto" \| "simulate"` | `"auto"` | auto uses the browser's speech recognition when available, simulate always plays a sample take |
| dictation | `string` |  | Sentence used for simulated dictation |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter: Sends what's in the prompt field
- Shift / Enter: Starts a new line – the field grows up to four lines, then scrolls
- Tab: Moves through the suggestions, the field, Send, the mic and New chat

### Accessibility

- The mic is a toggle button with aria-pressed and a label that says what it does next
- New messages are announced politely; the typing dots carry a label
- Everything works with the keyboard; dictation is optional

### Motion

- The glow keeps drifting in the lower half; the welcome view hands over to the chat with a short rise
- While listening, the mic turns dark with three calm bars and a soft ring breathing outwards; words appear live in the field
- When you stop speaking, the finished sentence moves into the chat as your message; replies stream in word by word
- With prefers-reduced-motion the glow stands still and replies appear at once

### Responsive

- Fills its container up to 380px wide
- Dictation uses the Web Speech API (Chrome, Edge, Safari) with the page language; elsewhere a short simulated take plays
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

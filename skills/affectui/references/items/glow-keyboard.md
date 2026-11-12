# Glow Keyboard (Pro)

AI chat input that types itself over a glass keyboard – every key press sends a wave up the gradient floor

- Page: https://www.affectui.com/illustrations/glow-keyboard
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/glow-keyboard.json` (needs the Pro access key)
- Import: `@/components/ui/glow-keyboard`

### When to use

- Hero sections for AI assistants, chat or writing tools – the prompt types itself and invites people to try
- Landing pages that want an interactive scene instead of a video

### When not to use

- As your real chat input – it is a showcase; use Chat Composer for a working input
- Small cards on mobile – the keyboard legends get tiny below ~360px width

### Usage

```tsx
import { GlowKeyboard } from "@/components/ui/glow-keyboard";

export function Hero() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto" }}>
      <GlowKeyboard />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| prompts | `string[]` | `three hiking prompts` | Prompts the demo types one after another; each one is sent with Enter |
| placeholder | `string` | `"Ask AI anything..."` | Placeholder of the chat input |
| onSubmit | `(text: string) => void` |  | Called when a prompt is sent with Enter – by the demo or the user |
| label | `string` | `"AI chat input above a glass keyboard…"` | Accessible name of the scene |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Keyboard

- Click: Anywhere on the scene puts the cursor into the input and stops the demo
- Any key: Types and lights up the same key on the drawn keyboard
- Enter: Sends the prompt and clears the input

### Accessibility

- The input is a real text field with a label; the drawn keyboard and the floor are hidden from screen readers
- The demo stops as soon as the input gets focus, so it never types over the user

### Motion

- The demo types each prompt with an uneven, human rhythm, holds Shift for capitals and corrects one typo
- Every key press: the key sinks in, a wave rises out of the gradient below it and the input glow flashes at the same spot
- The floor's two layers – colour and white plus-lighter – drift and morph slowly
- Runs only while on screen; with prefers-reduced-motion the scene stays still and the demo does not type, typing yourself still works

### Responsive

- Keeps an 11 : 6 frame and scales to the width of its container – every detail is sized in container units
- Set the background with --ui-gk-bg (default #fafafa, #111113 in dark mode)
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: gradient-floor, chat-composer

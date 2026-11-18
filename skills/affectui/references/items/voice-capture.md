# Voice Capture (Pro)

A dictation panel while someone speaks – the voice in a quiet well as thin bars rising and falling with the loudness, the time ticking, a soft color glow beneath it

- Page: https://www.affectui.com/illustrations/voice-capture
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/voice-capture.json` (needs the Pro access key)
- Import: `@/components/ui/voice-capture`

### When to use

- Hero or feature section of a product with voice input – dictation, voice notes, talking to an agent
- Beside a headline or at the edge of a card – the panel runs out into the page on the right, so it can sit against an edge
- Launch posts and OG images – a still frame with playing={false} reads well small

### When not to use

- As a real recorder – it's a picture of one; it doesn't listen and nothing in it can be clicked
- In tight spaces – it needs about 420 × 230px, and its fade wants room on the right

### Usage

```tsx
import { VoiceCapture } from "@/components/ui/voice-capture";

export function Hero() {
  return (
    <section className="relative">
      <h1>Just say it</h1>
      <VoiceCapture className="absolute right-0 top-24" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| playing | `boolean` | `true` | Runs the voice, the glow and the time – false holds a still frame |
| start | `number` | `7` | The time it starts from, in seconds |
| className | `string` |  | Extra class on the root |

### Accessibility

- Decorative: the whole illustration is hidden from screen readers and takes no clicks
- With prefers-reduced-motion nothing moves: the voice, the glow and the time stand still

### Motion

- The voice stands still in the well; each bar rises and falls with the loudness, neighbours a little out of step, pauses stay dots
- A blurred glow of blue, purple and pink drifts slowly under the panel – it shows only below it
- The red dot breathes and the time counts up every second

### Responsive

- Fixed size, about 420 × 230px with its shadow and fade – scale it with zoom or a transform for smaller screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The voice is drawn on a canvas snapped to whole device pixels, so every bar is equally thick at any zoom; VOICE holds its bar heights – swap it for another rhythm
- Colors are variables on .ui-vcp – --ui-vcp-bar for the voice, --ui-vcp-rec for the dot, --ui-vcp-blue / -purple / -pink for the glow

### Requirements

- React 19

Related: voice-orb, progress-pill, model-menu, glow-keyboard

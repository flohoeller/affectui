# Voice Orb (Pro)

The face of a voice assistant – a sphere of dots that breathes, catches sound, collapses into a spinning ring while thinking and ripples when it speaks

- Page: https://www.affectui.com/illustrations/voice-orb
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/voice-orb.json` (needs the Pro access key)
- Import: `@/components/ui/voice-orb`

### When to use

- Voice mode of an assistant: one calm object that shows whether the AI listens, thinks or talks
- Hero of an AI product page, an empty state before the first prompt, or a call screen
- Anywhere a spinner would undersell what is happening – the orb says which phase it is

### When not to use

- Inline in a chat thread or next to text – use Thinking Loader or Thinking State, they are made for small sizes
- As decoration that never changes state – a still image costs nothing; the orb draws every frame
- Below about 96px – the dots merge into a blob

### Usage

```tsx
import { VoiceOrb } from "@/components/ui/voice-orb";

export function VoiceMode() {
  const { state, level, toggle } = useVoiceSession(); // "idle" | "listening" | "thinking" | "speaking", 0–1
  return <VoiceOrb state={state} level={level} onPress={toggle} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| state | `"idle" \| "listening" \| "thinking" \| "speaking"` | `"idle"` | What the assistant is doing – the orb melts from one state into the next |
| level | `number` |  | Loudness from 0 to 1 while listening or speaking. Without it the orb makes up a natural-looking level |
| size | `number` | `220` | Edge length in px |
| dots | `number` | `520` | Number of dots – raise it for large sizes |
| accent | `string` | `blue` | Color the moving dots take on; resting dots use the text color |
| label | `boolean \| Partial<Record<state, string>>` | `true` | The line under the orb – false hides it, an object replaces single texts |
| interactive | `boolean` | `true` | Dots give way to the mouse pointer |
| onPress | `() => void` |  | Makes the orb a button, e.g. to start and stop listening |
| className | `string` |  | Extra class on the root |
| style | `CSSProperties` |  | Inline styles on the root – set color here to change the resting dots |

### Keyboard

- Enter / Space: With onPress: presses the orb

### Accessibility

- The canvas is decorative; the state is in the label, which is announced politely when it changes
- With onPress the orb is a real button named by its label; without it, an image named after the state
- With prefers-reduced-motion nothing moves: the orb shows one still frame per state (sphere, raised dots, ring, waves)
- The colors follow the text color and adapt to dark mode on their own

### Motion

- Idle: the sphere turns slowly and breathes
- Listening: dots jump outward with the level and take on the accent color; a soft glow follows the loudness
- Thinking: the sphere collapses into a tilted, fast spinning ring with a light running around it
- Speaking: waves travel from pole to pole with the level
- States are blended, never switched – every dot glides from one shape to the next in about a third of a second
- The animation pauses while the orb is off screen or the tab is in the background

### Responsive

- Fixed square of size px – pass a smaller size on phones; it is sharp on high-density screens
- Touch screens: no pointer effect, the press works as usual
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Changing state or level never restarts the animation – only size and dots rebuild the canvas
- Smooth a raw microphone level a little before passing it, or pass it as is: the orb eases towards it anyway

### Requirements

- React 19

Related: thinking-loader, thinking-state, chat-composer

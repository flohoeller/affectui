# Voice Session, clean style (Pro)

A live voice call with an agent – both voices as audio waves with the pause between them measured, the words as they are spoken, voice-to-voice latency split up against a budget

- Page: https://www.affectui.com/components/voice-session
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/voice-session-clean.json` (needs the Pro access key)
- Import: `@/components/ui/voice-session-clean`

### When to use

- A live voice call with an agent – support lines, phone agents, voice assistants in your app
- Showing who speaks, how long the agent takes to answer and what it says, word by word
- Watching voice-to-voice latency per turn against a budget – where the time goes and the P50 of the call

### When not to use

- A text chat – use Response Stream for the answer, Chat Composer for the input
- Monitoring many calls at once – this is one call

### Usage

```tsx
import { VoiceSession } from "@/components/ui/voice-session-clean";

export function Call({ turns, status, levels }) {
  return (
    <VoiceSession
      agent={{ id: "atlas", name: "Atlas" }}
      subtitle="Billing support"
      personName="Maya"
      status={status} // "connecting" | "listening" | "thinking" | "speaking" | "ended"
      turns={turns}
      levels={levels} // { person: 0.4, agent: 0 } – from your audio analyser
      startedAt={callStart}
      onBargeIn={() => call.interrupt()}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| agent | `{ id, name, color? }` |  | Who is on the call – its pixel mark is drawn from the id, its voice in color (blue by default) |
| title | `string` | `agent.name` | Heading of the card |
| subtitle | `string` |  | What the call is about, next to the heading |
| personName | `string` | `"You"` | The person's name on their lane and in the transcript |
| personAvatar | `string` |  | The person's photo before their name – their initial in a circle without one; the agent always shows its pixel mark |
| status | `"connecting" \| "listening" \| "thinking" \| "speaking" \| "ended"` |  | Where the call is – the badge, the mark, the lanes and the big number follow it |
| turns | `VoiceTurn[]` |  | { id, speaker, text, spoken?, interrupted?, responseMs?, latency? } – oldest first; the last exchange is the transcript, every agent turn counts toward the P50 |
| levels | `{ person?, agent? }` |  | How loud each side is right now, 0 to 1 – sampled every 90ms into the lanes |
| initialLevels | `{ person?, agent? }[]` |  | The last seconds before the card opened, one entry per 90ms – the lanes start filled, e.g. when a call is reopened |
| startedAt | `number` |  | Date.now() when the call started – the footer counts from here |
| budgetMs | `number` | `800` | Voice to voice above this is over budget: a red badge and a red pause |
| paused | `boolean` | `false` | The lanes stand still and the call time stops |
| onPauseChange | `(paused: boolean) => void` |  | Pause / Resume |
| onBargeIn | `() => void` |  | Barge in – take over from the agent |
| settings | `VoiceSettingsSection[]` |  | { title?, items: { id, label, icon?, checked?, onSelect? }[] }[] – what the settings icon opens; items with checked show a check and keep the menu open |
| showTranscript | `boolean` | `true` | The words of the turn above the lanes |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Move through the settings icon, the pause labels, the latency parts (each highlights its slice), Pause and Barge in
- Enter / Space: Press a button, open the settings or pick an item
- ↑ / ↓ / Home / End: Move through the settings menu
- Esc: Close the settings menu – focus goes back to its icon

### Accessibility

- Each turn is read out once it is over, never word by word; status changes are announced by the badge
- Every pause label is a button whose name says how long the agent took and where the time went
- Pause is a toggle button (aria-pressed); the lanes are decoration and hidden, the latency bar carries its numbers as a label

### Motion

- Each 90ms a new bar grows in from the line over about a quarter second and the lanes glide left; while the agent thinks a blue shimmer runs along its lane and the big number counts
- The agent's mark twinkles while it thinks or speaks; words firm up from faint to ink as they are spoken
- Reduced motion: bars appear at full height, the lanes step instead of gliding, no shimmer or twinkle

### Responsive

- The card keeps its height – each transcript line keeps its newest two rows, the legend reserves its row while measuring
- Below 380px the names move above their lines, the subtitle steps aside and the legend wraps
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: response-stream, thinking-state, chat-composer, metering-chart

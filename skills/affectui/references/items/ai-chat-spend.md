# AI Chat / Spend Planner (Pro)

A chat about what AI costs you – spend by provider and model, the weekly trend and a plan to play with: move three levers and the savings and the forecast follow

- Page: https://www.affectui.com/screens/ai-chat-spend
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/ai-chat-spend.json` (needs the Pro access key)
- Import: `@/components/ui/ai-chat-spend`

### When to use

- A chat about what AI costs – where the money goes, how it grows, and what to change – that answers with charts
- Letting people try a plan before they commit: move a few levers and see the savings and the forecast follow
- Asking about exactly the part they mean – drag across weeks on a line, or click a provider's bar

### When not to use

- Spend over time without a conversation – use Agent / Usage
- A rate limit plan per agent – use Rate Limit Planner
- Revenue rather than cost – use AI Chat / Revenue Analyst

### Usage

```tsx
import { SpendChatScreen, type ChartFocus } from "@/components/ui/ai-chat-spend";

export default function Page() {
  return (
    <SpendChatScreen
      onAsk={async (question: string, focus?: ChartFocus) => {
        const res = await fetch("/api/spend", { method: "POST", body: JSON.stringify({ question, focus }) });
        return res.json(); // { role: "assistant", text, kpis?, chart?, caption?, sources?, next? }
      }}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onAsk | `(question, focus?) => Answer \| Promise<Answer>` |  | How the screen answers – an answer is { role: "assistant", text, kpis?: { label; value; change?; since?; goodWhenDown? }[], chart?, caption?, sources?, next? }. focus is set when the question is about part of a chart: { chart, from, to, label, detail }. Without it the screen answers the questions it offers from its sample |
| chart | `{ kind: "split" \| "trend" \| "forecast" \| "plan"; … }` |  | "split": { title, previous?, since?, groups: { name, logo?, color?, parts: { name, value }[] }[] } – one bar per provider or team, a segment per model, drawn with Model Usage (values in dollars). "trend": { labels, current, previous, mark? } and "forecast": { labels, actual, forecast, target? } – drawn with Trend Chart (values in thousands). "plan": { now, months, growth, levers } – the totals, the levers and the forecast that follows them |
| levers | `{ id; label; detail; kind: "range" \| "switch"; base; save; max?; value }[]` |  | The changes a plan offers. base is what it touches a month in dollars, save the share of that it saves at full; a slider goes from 0 to max %, a switch is on (1) or off (0). What each saves, the totals and the six-month forecast follow as they move. Turn into rules asks the next question with the plan quoted above it |
| turns | `ChatTurn[]` |  | The conversation so far – { role: "user", text, quote? } and answers as above |
| chats | `ShellChat[]` |  | The chats in the sidebar |
| loading | `boolean` |  | Gray lines, cards and chart in place of the conversation |
| empty | `boolean` |  | A new chat – a short note and questions to start with |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Through the levers, the charts and the buttons
- ← / →: On a slider: 5% at a time – on a line chart: from point to point
- Space: On the batch switch: on or off
- Enter: On a line chart: start a pick, stretch it with the arrows, Enter again to ask – on a bar: pick it
- Esc: Close the field over a pick – back to the chart

### Accessibility

- Each slider is named by its lever and says what it saves; the batch switch is a role="switch"
- Every chart is focusable and named by its caption; stepping through it shows each point's numbers in a tooltip screen readers hear
- The answer is marked busy while its words arrive; a polite live region says when it is working and when something was copied
- Rings show for the keyboard only – never on the text fields

### Motion

- While it works the pixel mark twinkles beside "Reading your usage…"; the words arrive one by one, then the cards and the chart rise in
- Moving a lever rolls the totals and lets the forecast glide to its new line – Trend Chart and Model Usage bring their own motion and tooltips
- With prefers-reduced-motion everything is simply there

### Responsive

- The sidebar starts folded to its icons so the chat has the room; the column stays at 760px in the middle, cards and charts as wide as the composer
- On phones the mark steps back, cards sit two by two, sliders take the whole width and grow to touch size
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Assistant Home, Chat Composer, Trend Chart and Model Usage (installed with it)

Related: ai-chat-revenue, model-usage, trend-chart, agent-usage, rate-limit-planner

# Revenue Chat (Pro)

A chat that answers with charts, on its own – KPI cards, a trend against last year, a split by region or a forecast; drag across a line or click a bar to ask about just that part

- Page: https://www.affectui.com/blocks/revenue-chat
- Section: Blocks · Analytics
- Install: `npx shadcn@latest add https://www.affectui.com/r/revenue-chat.json` (needs the Pro access key)
- Import: `@/components/ui/revenue-chat`

### When to use

- A chat that answers questions about numbers with something to look at – KPI cards and a chart under a few plain lines – inside your own page, without the App Shell
- Letting people ask about exactly the part they mean – drag across weeks on a line chart, or click a bar, and ask right there, the way you'd select a sentence
- Analytics, finance or reporting assistants where the trend matters more than the sentence

### When not to use

- The whole app around it – sidebar, chats, account – use the screen AI Chat / Revenue Analyst
- A dashboard you look at without asking – use Analytics
- A chat about tasks and files – use AI Chat / Agents
- A chart on its own in a card – use Trend Chart or Model Usage

### Usage

```tsx
import { RevenueChat, type ChartFocus } from "@/components/ui/revenue-chat";

export default function Page() {
  return (
    <div style={{ height: 720 }}>
    <RevenueChat
      onAsk={async (question: string, focus?: ChartFocus) => {
        // focus is set when the question is about part of a chart: { chart, from, to, label, detail }
        const res = await fetch("/api/analyst", { method: "POST", body: JSON.stringify({ question, focus }) });
        return res.json(); // { role: "assistant", text, kpis?, chart?, caption?, sources?, next? }
      }}
    />
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onAsk | `(question, focus?) => Answer \| Promise<Answer>` |  | How the screen answers – return an answer or a promise of one. An answer is { role: "assistant", text, kpis?: { label; value; change? }[], chart?, caption?, sources?, next? }. Without it the screen answers the questions it offers from its sample, and works out answers about picked parts from the chart's own numbers |
| focus | `{ chart; from; to; label; detail }` |  | Passed to onAsk when the question is about part of a chart: the chart, the first and last point of the stretch dragged across (or the bar clicked), and how it reads – label "W32 – W34", detail "$284K · +18.3% on last year". The question shows in the chat with that above it, like a quote |
| chart | `{ kind: "trend" \| "split" \| "forecast"; … }` |  | "trend": { labels, current, previous, mark? } – this year against the last, drawn with Trend Chart as an area. "forecast": { labels, actual, forecast, target? } – what happened, then a dashed forecast and the target, drawn with Trend Chart. "split": { title, previous?, since?, groups: { name, parts: { name, value }[] }[] } – one bar per group with a segment per part, drawn with Model Usage. Line values are thousands of dollars, split values dollars |
| turns | `ChatTurn[]` |  | The conversation so far – { role: "user", text, quote? } and answers as above |
| loading | `boolean` |  | Gray lines, cards and chart in place of the conversation |
| empty | `boolean` |  | A new chat – a short note and questions to start with |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: Into a chart – ← / → step through its points, Home / End jump
- Enter / ← / →: On a line chart: Enter starts a pick at the highlighted point, the arrows stretch it, Enter again opens the field to ask about it
- Enter / Space: On a bar: pick it and ask about it
- Enter: In the composer or the field over a pick: ask
- Esc: Close the field over a pick – back to the chart it came from

### Accessibility

- Every chart is focusable and named by its caption; stepping through it shows each point's numbers in a tooltip that screen readers hear
- The field over a pick is named with what's picked and its numbers; its keys show under the chart once the chart has the keyboard's focus
- The answer is marked busy while its words arrive; a polite live region says when it is working and when something was copied
- Rings show for the keyboard only – never on the text fields

### Motion

- While it works the assistant's pixel mark twinkles beside "Reading Stripe and HubSpot…"; the answer's words arrive one by one with a caret, then the KPI cards and the chart rise in – Trend Chart and Model Usage bring their own motion and tooltips
- Dragging across a line chart lays a light blue band over the stretch with a line on either side; a clicked bar gets a blue ring – a small field opens above it, and the chart's own tooltips step aside
- With prefers-reduced-motion everything is simply there

### Responsive

- It fills the box you put it in – give that box a height – and has no background of its own, so it sits on your page; the conversation scrolls inside, the column stays at 760px in the middle, and cards and charts are as wide as the composer below
- On phones the mark steps back, KPI cards sit two by two and the charts keep their height; sliding a finger sideways picks a stretch, up and down still scrolls, a tap picks a bar – the hint under the chart names the gesture of the device, and the field uses 16px text so iOS does not zoom in
- Big numbers shorten – $1.24M, $2.28B – and a value too long for its card ends in … with the whole one on hover
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- Chat Composer, Trend Chart, Model Usage, Empty State and Skeleton (installed with it)

Related: ai-chat-revenue, trend-chart, model-usage, chat-composer, kpi-board

# AI Search / Prompt Explorer (Pro)

What people ask AI assistants – type a prompt on a soft gradient hero and see related searches with their volume, analyse them, and browse popular and trending keywords

- Page: https://www.affectui.com/screens/prompt-explorer
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/prompt-explorer.json` (needs the Pro access key)
- Import: `@/components/ui/prompt-explorer`

### When to use

- AI search and answer-engine tools – what people ask ChatGPT and other assistants, how often, and whether it grows
- Keyword or prompt research with a search-first start: type, see completions with their volume, analyse
- A product's home that leads with one field on a calm gradient, with lists of what's popular under it

### When not to use

- A chat with the assistant itself – use Assistant Home or AI Chat
- Charts of numbers over time – use Analytics or Trend Chart

### Usage

```tsx
import { PromptExplorerScreen } from "@/components/ui/prompt-explorer";

export default function Page() {
  return (
    <PromptExplorerScreen
      prompts={suggestions}
      popular={popular}
      rising={rising}
      falling={falling}
      onAnalyse={(prompts) => api.analyse(prompts)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Northwind"` | The workspace in the sidebar – and the brand the analysis counts mentions of |
| title | `ReactNode` | `"Explore what people are prompting ChatGPT"` | The heading over the field |
| prompts | `{ id; text; volume; change; trend? }[]` |  | What the field completes from: each prompt with how many times a month people ask it and how much that changed since last month |
| popular | `{ id; text; volume; change; trend? }[]` |  | Popular keywords, on the left |
| rising / falling | `{ id; text; volume; change; trend? }[]` |  | Trending keywords, on the right – the switch picks the list; trend is twelve months for the sparkline |
| onAnalyse | `(prompts: string[], mode: "keyword" \| "url") => PexResult[] \| Promise<PexResult[]>` |  | How Analyse answers – one prompt, or one per line with Bulk analysis. A result is { text, volume, change, trend, share }, share being how often answers mention you (0–1). Left out, the screen makes up steady numbers |
| loading | `boolean` |  | Gray rows in place of the keywords – the field still works |
| empty | `boolean` |  | No keyword data yet – both lists say so |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↓ / ↑: In the field: through the relevant searches
- Enter: Pick the highlighted search, or analyse what you typed – with Bulk analysis Enter starts a new line
- ⌘ / Enter: Analyse every line in Bulk analysis
- Esc: Close the relevant searches
- ← / →: Between Prompts and Page, and between Rising and Falling

### Accessibility

- The field is a combobox with its searches as a listbox – the highlighted one is read out as you move
- Each keyword is a button named with its volume and change; the switches are radio groups and Bulk analysis a switch
- Rings show for the keyboard only – never on the field, whose card just gets a firmer edge

### Motion

- The hero's light drifts: its blue, cyan and lavender layers each move on their own slow loop, so the colours keep shifting
- The searches drop open under the field as you type, joined to it as one card; results rise in above the keywords
- With prefers-reduced-motion the light holds still and nothing slides

### Responsive

- The gradient fades to the page before the keyword card starts, so the lists always sit on a plain background
- Popular and Trending sit side by side, and stack on narrower screens; result rows drop the year and the share
- Volumes shorten – 549.4k, 1.2M, 1.2B – and long keywords end in … with the whole one on hover
- On phones the hero and heading shrink, the field uses 16px text so iOS doesn't zoom, and the sparklines step back
- Dark mode built in: the same gradient turned to night – switches when an ancestor has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: assistant-home, analytics, trend-chart, model-usage

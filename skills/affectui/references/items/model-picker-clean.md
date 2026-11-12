# Model Picker, clean style (Pro)

The model menu of an AI chat – point at a model and its speed, quality and cost bars fill, switch on extended thinking and its effort unfolds, while the tray rolls the first-token time and price

- Page: https://www.affectui.com/components/model-picker
- Section: Components · Chat
- Install: `npx shadcn@latest add https://www.affectui.com/r/model-picker-clean.json` (needs the Pro access key)
- Import: `@/components/ui/model-picker-clean`

### When to use

- The model switch in the toolbar of a chat composer – the place people decide between fast, cheap and smart
- Products with a few models that differ in speed, quality and price, and settings that ride along with the model: thinking, effort, web search
- When people should see what a choice costs them before they send – the last row of the menu shows first-token time and price

### When not to use

- Dozens of models from many providers – use Combobox or Command Menu, where people can type to search
- A setting page that lists every parameter – this menu is for the two or three things people change between messages
- A plain two-way choice – Segmented Control says it with less

### Usage

```tsx
import { ModelPicker } from "@/components/ui/model-picker-clean";

const models = [
  { id: "opus", name: "Opus 5.5", description: "Hardest problems", speed: 2, quality: 5, cost: 5, latencyMs: 2100, pricePerM: 25 },
  { id: "sonnet", name: "Sonnet 5.5", description: "Everyday work", speed: 4, quality: 4, cost: 3, latencyMs: 900, pricePerM: 15 },
  { id: "haiku", name: "Haiku 5.5", description: "Quick and light", speed: 5, quality: 3, cost: 1, latencyMs: 400, pricePerM: 4 },
];

export function ComposerToolbar() {
  return (
    <div className="toolbar">
      <ModelPicker models={models} defaultValue="sonnet" />
      <SendButton />
    </div>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| models | `PickerModel[]` |  | { id, name, description?, icon?, speed?, quality?, cost?, latencyMs?, pricePerM? } – strengths go from 1 to 5 (cost 5 is the most expensive); leave all three out for a router like Auto and the row says "Varies" |
| value | `string` |  | Id of the chosen model (controlled) |
| defaultValue | `string` | `first model` | Chosen model when uncontrolled |
| onChange | `(id: string) => void` |  | Called with the picked model's id |
| thinking | `boolean` |  | Extended thinking switch (controlled) |
| defaultThinking | `boolean` | `false` | Starting state of the thinking switch |
| onThinkingChange | `(on: boolean) => void` |  | Called when the thinking switch flips |
| webSearch | `boolean` |  | Web search switch (controlled) |
| defaultWebSearch | `boolean` | `false` | Starting state of the web search switch |
| onWebSearchChange | `(on: boolean) => void` |  | Called when the web search switch flips |
| effort | `"low" \| "medium" \| "high"` |  | Thinking effort (controlled) – the control only shows while thinking is on |
| defaultEffort | `"low" \| "medium" \| "high"` | `"medium"` | Starting effort |
| onEffortChange | `(effort) => void` |  | Called with the new effort |
| open | `boolean` |  | Controlled open state of the menu |
| defaultOpen | `boolean` | `false` | Starts open when uncontrolled |
| onOpenChange | `(open: boolean) => void` |  | Called when the menu opens or closes |
| align | `"start" \| "end"` | `"start"` | Which edge of the trigger the menu lines up with |
| side | `"bottom" \| "top"` | `"bottom"` | Opens below or above the trigger – use top for a composer at the bottom of the screen |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter / Space / ↓: On the trigger: opens the menu and moves into the model list
- ↑ / ↓ / Home / End: In the list: moves between models – the last row follows
- Enter / Space: In the list: picks the model and closes the menu
- Tab: From the list to Extended thinking, Effort and Web search
- ← / →: In Effort: Low, Medium, High
- Esc: Closes the menu and returns to the trigger

### Accessibility

- The trigger has aria-haspopup, aria-expanded and aria-controls; its name carries the model and whether thinking is on
- Models are a listbox with options and aria-activedescendant, so focus stays on the list while the arrows move
- Thinking and web search are switches, Effort is a radio group with one tab stop
- While closed the menu is inert; the last row's numbers are announced politely once, not while they roll

### Motion

- The menu opens with a short fade and a soft scale from the corner of the trigger, and closes the same way
- Pointing at a model fills its bars segment by segment and steps the other rows back
- Effort unfolds under the thinking switch; its soft fill slides to the chosen level, and the lit row's bars fill in blue
- First-token time and price roll to their new values; the model name in the trigger crossfades and a small bulb unfolds next to it while thinking is on
- With prefers-reduced-motion everything switches without movement

### Responsive

- The menu is 320px wide and never wider than the screen minus 32px. Below 300px the row glyphs and key hints give way and the bars move closer
- Touch screens: taller trigger, rows, switches and effort buttons; the key hints are hidden
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The menu is positioned absolutely from the trigger – keep the composer's overflow visible, or the menu gets cut
- Pick side="top" when the composer sits at the bottom of the viewport, and align="end" when the trigger is on the right
- latencyMs is the time without thinking; the last row multiplies it by the effort (×1.6, ×2.5, ×4) while thinking is on
- Keep descriptions to two or three words – the row has room for one short line next to the bars

### Requirements

- React 19

Related: chat-composer, combobox, segmented-control, context-window

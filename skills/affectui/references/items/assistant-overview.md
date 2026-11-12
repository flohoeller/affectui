# AI Chat / Overview (Pro)

The AI workspace start page with your numbers under the composer – activity day by day, recent chats, usage, the files it made and this month against the last

- Page: https://www.affectui.com/screens/assistant-overview
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/assistant-overview.json` (needs the Pro access key)
- Import: `@/components/ui/assistant-overview`

### When to use

- The start page of an AI workspace for people who come back every day – what they did, what's left of their plan, what it made for them
- A home that doubles as a dashboard: one composer to start, the numbers right below

### When not to use

- A first visit or an empty workspace – AI Chat / Start with its quick prompts helps more

### Usage

```tsx
import { AssistantOverviewScreen } from "@/components/ui/assistant-overview";

export default function Page() {
  return <AssistantOverviewScreen workspace="Acme" user={{ name: "Alex Morgan" }} onNavigate={(label) => router.push(routes[label])} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with Chat or Folders from the cards' rows and their “N more” |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your data loads: the board under the composer shows gray placeholders in the shape of the real activity, chats, usage, files and numbers |
| empty | `boolean` |  | A new workspace: the composer stays, the board under it gives way to one empty state – “Nothing here yet”, a line on what shows up here and a Start a chat button that puts the cursor in the composer |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab: From the composer through the activity grid, each card's “N more” and its rows
- ← / →: In the activity grid: a week back or on – the tip says the day and its chats
- ↑ / ↓: In the activity grid: the day before or after
- Home / End: In the activity grid: the first and the last day
- Esc: In the activity grid: hides the tip

### Accessibility

- Every card is a section named by its heading; the rows of chats and files are buttons
- The activity grid is one image with its sum as its label – hovering or tapping a square, or walking the days with the arrow keys, shows its day and count in a small tip – said aloud from the keyboard; the usage bar is a meter with its value; each trend says what it compares, e.g. “+12 on last month”
- Color is never the only signal: the trends carry their sign, the grid its label, and usage over the limit says so in words
- Long names end in “…” before the time; file names keep their extension, so files that differ at the end stay apart

### Responsive

- Four columns under the composer: activity and recent chats on top, usage, files and this month below
- Narrower, two columns – the wide cards stay wide; on a phone they stack; the activity grid always fills its card
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, AI Chat / Start and Button (installed with it)

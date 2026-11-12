# Agent / Activity (Pro)

What your agent did – every step as a sentence with its app's logo, the task and who let it (on its own or you approved), grouped by day; Undo while it can be taken back draws a line through it, and each step says why it could and what Undo does

- Page: https://www.affectui.com/screens/agent-activity
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-activity.json` (needs the Pro access key)
- Import: `@/components/ui/agent-activity`

### When to use

- Showing what an agent actually did in your apps – step by step, in words, with who let it
- Taking a step back while it still can be – and saying plainly when it can't
- Answering why it could: the rule it acted under, or the moment you approved it

### When not to use

- The calls and tokens inside one run – use Agent / Orchestration
- What waits for a decision – use Agent / Inbox
- What it may do – use Agent / Permissions

### Usage

```tsx
import { AgentActivityScreen } from "@/components/ui/agent-activity";

export default function Page() {
  const [items, setItems] = useState(initialActivity);
  return (
    <AgentActivityScreen
      apps={connectedApps}          // logos mark the rows
      items={items}
      onUndo={async (item) => {
        // the row already shows Undone – put it back if this fails
        const ok = await api.undo(item.id);
        if (!ok) setItems((l) => l.map((a) => (a.id === item.id ? { ...a, undone: false } : a)));
      }}
      onOpenTask={(task) => router.push("/tasks?task=" + task)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| apps | `{ id; name; account?; logo?; tile?; icon? }[]` | `seven sample apps` | The apps it works in – logo is an SVG on a white tile (or on tile, a brand color); without one, a Hugeicons icon |
| items | `{ id; at; app; text; task?; by: "auto" \| "approved"; rule?; approvedAt?; details?: { label; value }[]; preview?; undo?: { until; how }; final?; undone?; cost? }[]` |  | Everything it did, newest shown first. text is the step as a sentence; by says who let it; rule is the Permissions rule it acted under; details and preview say exactly what happened; undo makes Undo possible until a time and says what it does; final says why it can't be taken back. Pass a stable array (state) |
| defaultSelected | `string \| null` | `"a1"` | The step open on the right when the screen starts |
| onUndo | `(item: ActivityItem) => void` |  | Called with Undo – the row shows Undone right away; set undone: false again if it fails |
| onOpenTask | `(task: string) => void` |  | Called with the arrow next to the task – without it the screen calls onNavigate("Tasks") |
| onSelect | `(id: string) => void` |  | Called when a step is opened |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with "Permissions" from Why it could |
| labels | `{ activity?; all?; auto?; approved?; undo?; undone?; final?; why?; undoTitle?; … }` |  | Labels, e.g. for a translation |
| loading | `boolean` |  | While your activity loads: gray rows under gray day heads in the list and gray lines in the Step panel, in the shape of the real ones (the shared Skeleton) |
| empty | `boolean` |  | No activity at all: the list shows Nothing yet with a sentence on what shows up here and a Set permissions button (calls onNavigate with "Permissions"); the Step panel shows nothing open |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K / ↑ / ↓: From step to step
- Enter: Open the step on the right
- U: Undo the focused (or open) step, while it can be taken back
- /: Search – Esc clears it, ↓ steps into the results
- ← / →: All, On its own, You approved, Undone

### Accessibility

- Each step is a button named in full – the time, the sentence, the app, the task, who let it and whether it was undone; Undo is its own button named with the step
- A polite live region says what was taken back: "Undone: Sent the weekly update to Priya Shah"
- Who let it is said in words next to its dot; Final has its lock and its reason in the panel
- Rings show for the keyboard only and sit inside the rows; the search only firms up its edge

### Motion

- One moment: Undo draws a line through the sentence from the left, the words fade, and Undone pops in where the button was
- With prefers-reduced-motion the step simply shows as undone

### Responsive

- Fills its container – give it the full viewport height in your app
- Rows have a fixed rhythm: time, logo, sentence with task and who let it, and Undo or Final in a fixed column
- Below 560px the time makes room, the sentence takes two lines, Undo becomes its icon and the search folds to its icon until you type
- Long sentences end in '…' with the whole in a tooltip and the panel; a long preview shows six lines with Show all; a step from an app it doesn't know keeps a neutral mark, so every row lines up
- Touch targets grow to 36px on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-permissions, agent-usage, inbox

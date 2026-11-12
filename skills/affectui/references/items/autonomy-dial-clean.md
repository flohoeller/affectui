# Autonomy Dial, clean style (Pro)

How much an agent may do on its own – a three-stop dial, and its real actions gliding between “Runs on its own” and “Asks you first”, with a lock for what always asks

- Page: https://www.affectui.com/components/autonomy-dial
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/autonomy-dial-clean.json` (needs the Pro access key)
- Import: `@/components/ui/autonomy-dial-clean`

### When to use

- Settings of an agent product: how much the agent may do without asking
- Onboarding of a new agent, where people decide how much to trust it before the first run
- Anywhere a permission level is abstract – the list shows what the level actually means

### When not to use

- One decision before one action – use Approval Card
- Turning integrations on and off – use Integration Settings
- Many independent permissions with no levels – a plain list of switches is clearer

### Usage

```tsx
import { useState } from "react";
import { AutonomyDial, type AgentAction, type AutonomyLevel } from "@/components/ui/autonomy-dial-clean";

const actions: AgentAction[] = [
  { id: "read", label: "Read files and docs", detail: "Drive · Notion", risk: "safe" },
  { id: "draft", label: "Draft emails", risk: "safe" },
  { id: "send", label: "Send emails", detail: "To customers", risk: "risky" },
  { id: "delete", label: "Delete files", risk: "destructive" },
  { id: "spend", label: "Spend money", detail: "Up to $500", risk: "destructive" },
];

export function AgentPermissions() {
  const [level, setLevel] = useState<AutonomyLevel>(1);
  const [pinned, setPinned] = useState(["spend"]);
  return (
    <AutonomyDial
      title="Sales agent"
      actions={actions}
      level={level}
      onLevelChange={setLevel}
      pinned={pinned}
      onPinnedChange={setPinned}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| actions | `AgentAction[]` |  | The agent's actions: { id, label, detail?, risk: "safe" | "risky" | "destructive", icon? } |
| level | `0 \| 1 \| 2` |  | Controlled level: 0 Always ask, 1 If risky (safe actions run), 2 Full auto |
| defaultLevel | `0 \| 1 \| 2` | `1` | Starting level when uncontrolled |
| onLevelChange | `(level: AutonomyLevel) => void` |  | Another level was picked |
| pinned | `string[]` |  | Controlled ids of actions that always ask, whatever the level |
| defaultPinned | `string[]` | `[]` | Starting locks when uncontrolled |
| onPinnedChange | `(pinned: string[]) => void` |  | A lock was set or removed |
| title | `string` | `"Agent permissions"` | Heading, e.g. the agent's name |
| subtitle | `string` | `"What it may do without asking you"` | Line under the heading |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / →: Picks the previous or next level (also ↑ ↓)
- Tab: Moves from the levels to the locks of the actions
- Space: Sets or removes the focused lock

### Accessibility

- The levels are a radio group labelled "Autonomy", described by a sentence on what the chosen level means
- Both groups are labelled sections; every lock is a toggle button with aria-pressed and a label naming its action
- Every change is announced politely: the level and how many actions run on their own or ask first

### Motion

- Actions glide to their new group when the level or a lock changes, a beat after each other
- The card's height follows and the counts roll; the chosen level turns white with a soft lift
- With prefers-reduced-motion everything switches instantly

### Responsive

- Fills its container up to 400px
- Below 340px the detail lines are left out and the levels get tighter
- Without hover (touch) the locks are always visible; touch screens get taller rows
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- asksFirst(action, level, pinned) is exported – use the same rule when the agent runs, so the setting and the behaviour never drift apart
- Rule: pinned always asks; level 0 asks for everything; level 1 runs only "safe" actions; level 2 runs everything not pinned
- Only risky and destructive actions carry a small tag right after the name – a warning glyph and the word, on a soft orange or red – safe ones stay quiet
- The risk and lock glyphs are Hugeicons Free (MIT) – keep the credit comment when you copy the file

### Requirements

- React 19

Related: approval-card, agent-steering, integration-settings, agent-plan

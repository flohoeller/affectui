# Agent Mode (Pro)

A close crop of a chat composer on a soft gradient, where a cursor comes over to switch on the Agent pill and the placeholder turns into a task

- Page: https://www.affectui.com/illustrations/agent-mode
- Section: Illustrations · Product scenes
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-mode.json` (needs the Pro access key)
- Import: `@/components/ui/agent-mode`

### When to use

- Feature sections and launch posts for an agent mode in a chat product – the switch from asking to handing over a task, in one gesture
- Bento grids and hero sides – it fills its box with its own gradient, so it needs no background behind it
- Still images and OG pictures – active holds it on, with the cursor on the pill

### When not to use

- As a real composer – nothing in it can be typed or clicked. Use Chat Composer for that
- On touch-only pages where no one points – it plays on hover; pass active to show it on

### Usage

```tsx
import { AgentMode } from "@/components/ui/agent-mode";

export function Feature() {
  return (
    <section className="grid grid-cols-2 items-center gap-12">
      <div>
        <h2>Hand it the whole task</h2>
        <p>Switch on Agent and it plans, works and checks on its own.</p>
      </div>
      <AgentMode className="h-[480px]" />
    </section>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| placeholder | `string` | `"Ask anything"` | The placeholder while agent mode is off |
| agentPlaceholder | `string` | `"Give the agent a task"` | The placeholder once agent mode is on |
| label | `string` | `"Agent"` | The pill's label |
| agent | `string` | `"agent"` | The agent's id – its 3×3 pixel pattern comes from it |
| active | `boolean` |  | true holds it on, false holds it off – leave it out and it follows the pointer |
| className | `string` |  | Extra class on the root |

### Accessibility

- Decorative: the whole illustration is hidden from screen readers and holds nothing focusable
- With prefers-reduced-motion the cursor and the pill switch without gliding, and the gradient and caret hold still

### Motion

- On hover the cursor glides from its rest below right onto the pill in a straight line
- As it lands it presses, the pill dips and turns blue, the agent's pixel mark twinkles and the placeholder swaps for the task line with a soft blur
- When the pointer leaves, the cursor glides back and the pill goes quiet again; the gradient drifts slowly the whole time

### Responsive

- Fills its box (at least 320 × 400px); the composer is always wider than the box, so it is cut at the right edge at any size – scale it with zoom for smaller screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The gradient is the Prompt Explorer hero's – the same layers, drifting, light and dark
- The agent is drawn with affectUI's pixel mark, never a sparkles or bot glyph – pass another id for another pattern
- Text, icons and cursor sit in the middle of the box; with much longer placeholders set --ui-agm-content (default 304px) to their width so it stays centered
- Colors are variables on .ui-agm – --ui-agm-on and --ui-agm-on-bg for the active pill, --ui-agm-composer for the card

### Requirements

- React 19

Related: inspect-composer, progress-pill, chat-composer, prompt-explorer

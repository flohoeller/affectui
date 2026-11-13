# Flow Builder (Pro)

An automation drawn as a top-down flow you build in place – a + on every line adds a step, If / else forks into named paths, steps move and come back with Undo, and a test run sends a light down the line into the step that's working

- Page: https://www.affectui.com/components/flow-builder
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/flow-builder.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/flow-builder-clean.json` (needs the Pro access key) – lands as `flow-builder-clean.tsx`, import from `@/components/ui/flow-builder-clean` – its docs: `flow-builder-clean.md`
- Import: `@/components/ui/flow-builder`

### When to use

- Automation and agent products where people put together what happens after a trigger – onboarding, routing, follow-ups
- A flow that branches on a condition, built and tested in place, inside a settings page, a side panel or a dialog

### When not to use

- A free-form graph where anything connects to anything – this is a top-down flow with forks; use a canvas library
- Reviewing an agent's own plan before it runs – Agent Plan is made for that
- Watching runs that already happened – Trace Waterfall and Run Replay show those

### Usage

```tsx
import { FlowBuilder } from "@/components/ui/flow-builder";

export function Automation({ flow, run }) {
  return (
    <FlowBuilder
      name="Onboard new signups"
      steps={flow.steps}              // the first step is the trigger
      onStepsChange={flow.save}       // every add, move and remove
      status={run.status}             // { research: "done", welcome: "running", enterprise: "skipped" }
      onRun={run.start}
      onStop={run.stop}
      onSelect={(id) => openInspector(id)}
    />
  );
}

// A step
{ id: "welcome", kind: "action", icon: "mail", title: "Send welcome email", detail: "Gmail · from Flo",
  note: "A personal welcome, written from the research" }

// An If / else – each path has its own steps
{ id: "size", kind: "branch", title: "Company size", detail: "employees > 200",
  paths: [
    { id: "enterprise", label: "Enterprise", steps: [...] },
    { id: "self", label: "Self-serve", steps: [...] },
  ] }
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` | `"Untitled workflow"` | The workflow's name, in the header |
| steps / defaultSteps / onStepsChange | `FlowStep[]` |  | The flow, controlled or not – the first step is the trigger. A step is { id, kind, title, detail?, note?, icon?, paths? } – note is the line that shimmers while it runs |
| kind | `"trigger" \| "action" \| "agent" \| "branch" \| "wait"` |  | An agent step shows its pixel mark; a branch draws its paths side by side |
| icon | `"webhook" \| "schedule" \| "form" \| "mail" \| "message" \| "slack" \| "database" \| "http" \| "wait" \| "branch" \| "user" \| "task" \| "flash"` |  | The glyph in the step's tile |
| templates | `{ kind; title; detail?; icon?; paths? }[]` |  | What the + menu offers – paths names the paths of a new If / else |
| triggers | `FlowTemplate[]` |  | What Add a trigger offers while the flow is empty |
| status | `Record<string, "idle" \| "running" \| "done" \| "failed" \| "skipped">` |  | The test run, by step id; a path id set to skipped fades the whole path |
| selected / defaultSelected / onSelect | `string \| null` |  | The selected step – open your own inspector from onSelect |
| onRun / onStop | `() => void` |  | Run test, and Stop while it runs; Run test needs onRun and at least two steps |
| height | `number` | `420` | Height of the canvas in px – it scrolls and pans inside |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Through the steps and the + on each line
- ↑ / ↓ / Home / End: From step to step, in reading order – into the paths too
- Enter / Space: Select a step, or open the + menu
- ⌥ / ↑ / ↓: Move the step up or down in its path
- ⌫: Remove the step – the one before it gets the focus; an If / else hands its first path's steps back up
- ⌘ / Z: Undo the last change
- Esc: Close the menu, then clear the selection

### Accessibility

- Each step is a toggle button (aria-pressed) whose status – Running, Passed, Failed, Skipped – is read with it
- Every + is named for where it adds: “Add a step after Research the company”, “Add a step at the start of Self-serve”
- The menu is a real menu: it opens with the focus on its first item, arrows move, Esc returns to the +
- Run results, removals and Undo are announced in a polite live region

### Motion

- The steps rise in one after another while their lines draw themselves down, dots and + popping in behind
- A step that starts gets a soft blue floor of light rising from where its line comes in; a light runs down the line into it, its line shimmers, its bar sweeps and its time counts up – an agent step's mark twinkles
- Tags swap with a small pop – Running, Passed, Failed; a skipped path fades and its name is struck through
- Reduced motion turns all of it off

### Responsive

- No background of its own – it sits on your page; the canvas keeps its height, scrolls both ways with soft edges, pans by dragging and opens centred on the flow
- Every step has one size, so nothing jumps while the test runs; each step's time is measured from the status you feed; long names end in an ellipsis with the full name on hover
- Below 480px the steps get narrower, so two paths still sit side by side
- The + menu opens below its line, or above it when there's no room, and stays inside the card
- On touch screens the key hints go and each + gets a bigger target
- Right-to-left: the layout mirrors
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: agent-plan, decision-tree, fallback-chain, integration-picker

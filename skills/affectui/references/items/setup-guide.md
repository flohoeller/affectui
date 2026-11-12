# Setup Guide (Pro)

Onboarding panel with a progress bar and collapsible task groups that strike through when done

- Page: https://www.affectui.com/components/setup-guide
- Section: Components · Feedback
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/setup-guide.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/setup-guide-clean.json` (needs the Pro access key) – lands as `setup-guide-clean.tsx`, import from `@/components/ui/setup-guide-clean` – its docs: `setup-guide-clean.md`
- Import: `@/components/ui/setup-guide`

### When to use

- Onboarding with several areas, each made of a few steps that build on each other
- A floating guide in a dashboard corner that people can fold away and come back to

### When not to use

- A single short list of steps – the Progress Tracker is lighter
- Steps that can be done in any order – here each task unlocks the next

### Usage

```tsx
import { SetupGuide } from "@/components/ui/setup-guide";

const groups = [
  {
    id: "workspace",
    title: "Set up your workspace",
    tasks: [
      { id: "name", label: "Choose a workspace name" },
      { id: "invite", label: "Invite your teammates" },
    ],
  },
  { id: "verify", title: "Verify your account", tasks: [{ id: "email", label: "Confirm your email", done: true }] },
];

export function Onboarding() {
  return <SetupGuide groups={groups} onChange={save} onClose={hideGuide} />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| groups | `SetupGroup[]` |  | Groups with an id, a title and tasks; each task has an id, a label and an optional done flag |
| title | `string` | `"Setup guide"` | Heading above the bar |
| onEdit | `() => void` |  | Shows an Edit link in the header |
| onClose | `() => void` |  | Shows a close button in the header |
| onChange | `(done: string[]) => void` |  | Called with the ids of all finished tasks |
| className | `string` |  | Extra class on the panel |

### Keyboard

- Tab: Move between groups, tasks and header buttons
- Enter / Space: Open or close a group, tick or untick a task

### Accessibility

- Group headers are buttons with aria-expanded, the closed panels are inert
- Tasks that are not unlocked yet are disabled; finished ones are pressed toggle buttons
- The bar is a progressbar with its percentage as value

### Motion

- Groups unfold smoothly; a finished group is struck through, folds away and opens the next one
- Reduced motion turns the transitions off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: progress-tracker, profile-menu

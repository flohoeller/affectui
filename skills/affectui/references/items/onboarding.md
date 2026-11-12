# Onboarding (Pro)

First-run flow of an AI workspace: workspace setup, tool connections, team invites and a first agent, with a getting-started checklist

- Page: https://www.affectui.com/screens/onboarding
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/onboarding.json` (needs the Pro access key)
- Import: `@/components/ui/onboarding`

### When to use

- The first minutes after sign-up in a workspace or AI product
- Guided setup that people can skip and pick up again later

### When not to use

- Long forms with many required fields – use the Stepper Form
- A single setting – show it inline instead of a whole flow

### Usage

```tsx
import { OnboardingScreen } from "@/components/ui/onboarding";

export default function Page() {
  return (
    <OnboardingScreen
      workspace="Acme"
      user={{ name: "Alex Morgan" }}
      defaultStep={1}
      onComplete={(values) => api.finishOnboarding(values)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| defaultStep | `1 \| 2 \| 3 \| 4` | `2` | Step shown first; the steps before it count as done |
| defaultInvites | `string[]` | `["jamie@acme.com"]` | Addresses already in the invite field, e.g. from the sign-up form |
| onComplete | `(values: OnboardingValues) => void` |  | Called after Create agent (or skipping the last step) with workspace, slug, team size, tools, invites, role and template |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item or a next step (Chat, Integrations, Analytics) |
| workspace | `string` | `"Acme"` | Workspace name in the sidebar, the greeting and the first field |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar; the first name is used in the greeting |
| className | `string` |  | Extra class on the root |

### Accessibility

- Each step is a form: Enter continues, the primary button submits
- The steps in the left column are buttons that jump to each step; the current one has aria-current
- Tool toggles are switches, templates a radio group; email chips can be removed with their button or Backspace
- Step transitions and checkmarks turn off with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height in your app
- The greeting and the steps sit in a column left of the step on wide panels and move above it on narrow ones
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Segmented Control and Button (installed with it)

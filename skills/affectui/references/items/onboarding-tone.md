# Onboarding / Tone (Pro)

Third step of setting up an AI assistant: a short left-aligned form for its name, tone, reply length and who takes over when it isn't sure; the dashboard glides down to a test chat that answers under that name, in that tone and length

- Page: https://www.affectui.com/screens/onboarding-tone
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/onboarding-tone.json` (needs the Pro access key)
- Import: `@/components/ui/onboarding-tone`

### When to use

- A step that needs a few settings at once – a short form instead of a single field
- Setting up how an AI assistant or agent behaves, with its effect shown live next to it

### When not to use

- Long settings pages – use the Settings screens
- One single choice – a field like the Website or Brand step is calmer

### Usage

```tsx
import { OnboardingToneScreen } from "@/components/ui/onboarding-tone";

export default function Page() {
  return (
    <OnboardingToneScreen
      domain={draft.domains[0]}
      brand={draft.names[0]}
      aliases={draft.names.slice(1)}
      onBack={() => router.push("/onboarding/brand")}
      onContinue={(values) => api.saveAssistant(values).then(() => router.push("/onboarding/done"))}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| domain | `string` | `"northwind.com"` | The website from the first step – the Knowledge table and the suggested handover address (support@…) |
| brand | `string` |  | The name from the step before; derived from the domain when left out |
| aliases | `string[]` | `["Northwind Co."]` | Short forms from the step before – tags on the assistant's card |
| defaultName | `string` |  | The assistant's name – "<brand> Assistant" when left out; shown on its card and over its replies |
| defaultTone | `"friendly" \| "neutral" \| "formal"` | `"neutral"` | The tone selected first |
| defaultLength | `"short" \| "balanced" \| "detailed"` | `"balanced"` | How long its replies are – the test chat's answer follows it |
| defaultHandover | `boolean` | `true` | Hand over to a person when unsure |
| defaultEmail | `string` |  | Where it hands over to – support@ the domain when left out |
| onContinue | `(values: { name, tone, length, handover, email }) => void` |  | Called when Continue is pressed; needs a name, and a valid address while handover is on |
| onBack | `() => void` |  | Shows Back in the top bar |
| layout | `"inset" \| "flat"` |  | The dashboard picture like the App Shell. Left out, it follows data-shell="flat" on an ancestor |
| autoFocus | `boolean` | `false` | Focus the first field when the step opens (Ready: Open dashboard) – turn it on in a real flow so the keyboard carries on from step to step |
| step / steps | `number` | `3 / 4` | Where this step sits in the flow |
| email, product, logo, onLogout, className | `` |  | As in Onboarding / Website |

### Accessibility

- Every field has its label on top; tone and reply length are radio groups – one tab stop each, arrow keys move the choice
- The handover is a switch labelled by its row; turning it off disables the address field
- Enter in a field continues; an invalid address is marked with aria-invalid and Continue stays off
- The dashboard on the right is decoration and hidden from assistive tech
- Animations turn off with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height
- The title sits at the same height as in the other steps, so moving between them nothing jumps
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- Onboarding / Website (installed with it – frame and dashboard come from there)

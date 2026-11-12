# Onboarding / Ready (Pro)

Last step of setting up an AI assistant: a quiet summary of what it learned from, its name, voice and handover, each with Edit; the dashboard glides back to its top and comes alive – numbers land, Draft turns Live

- Page: https://www.affectui.com/screens/onboarding-ready
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/onboarding-ready.json` (needs the Pro access key)
- Import: `@/components/ui/onboarding-ready`

### When to use

- The end of a setup flow – a calm look back at the answers before people start
- When the product comes alive with what they just set up and that moment is worth showing

### When not to use

- Long summaries with many settings – link to Settings instead
- Flows with one step – go straight to the product

### Usage

```tsx
import { OnboardingReadyScreen } from "@/components/ui/onboarding-ready";

export default function Page() {
  return (
    <OnboardingReadyScreen
      domains={draft.domains}
      brand={draft.names[0]}
      name={draft.assistant.name}
      tone={draft.assistant.tone}
      length={draft.assistant.length}
      handoverTo={draft.assistant.handover ? draft.assistant.email : undefined}
      onEdit={(step) => router.push(["/onboarding/website", "/onboarding/brand", "/onboarding/tone"][step - 1])}
      onFinish={() => api.publishAssistant().then(() => router.push("/"))}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| domains | `string[]` | `["northwind.com"]` | From the first step – the summary and the Knowledge count |
| brand / aliases | `string / string[]` |  | From the second step; brand is derived from the first domain when left out |
| name | `string` |  | The assistant's name from the third step – "<brand> Assistant" when left out |
| tone | `"friendly" \| "neutral" \| "formal"` | `"neutral"` | From the third step |
| length | `"short" \| "balanced" \| "detailed"` | `"balanced"` | From the third step |
| handoverTo | `string` | `"support@northwind.com"` | Who it hands over to; an empty string reads "Nobody – it answers itself" |
| onFinish | `() => void` |  | Open dashboard – the end of the flow |
| onEdit | `(step: 1 \| 2 \| 3) => void` |  | Shows Edit on every row; called with the step that row came from |
| onBack | `() => void` |  | Shows Back in the top bar |
| autoFocus | `boolean` | `false` | Focus the first field when the step opens (Ready: Open dashboard) – turn it on in a real flow so the keyboard carries on from step to step |
| step / steps | `number` | `4 / 4` | Where this step sits in the flow |
| email, product, logo, layout, onLogout, className | `` |  | As in Onboarding / Website |

### Accessibility

- The summary is a description list – each answer read with its label
- Every Edit button names what it edits ("Edit voice")
- The dashboard on the right is decoration and hidden from assistive tech
- With prefers-reduced-motion the dashboard is live at once, without the glide

### Responsive

- Fills its container – give it the full viewport height
- The title sits at the same height as in the other steps, so moving between them nothing jumps
- Long answers end in an ellipsis instead of wrapping
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- Onboarding / Website (installed with it – frame, dashboard and agent mark come from there)

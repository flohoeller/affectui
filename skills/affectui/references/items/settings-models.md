# Settings / Models (Pro)

Model settings with a settings sidebar: default chat and image models with an animated Auto explainer, every provider's models grouped by hosting region with a switch and access per model, filter, search, custom endpoints and your own API keys

- Page: https://www.affectui.com/screens/settings-models
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-models.json` (needs the Pro access key)
- Import: `@/components/ui/settings-models`

### When to use

- The models page of an AI workspace's settings
- Admin pages that switch many items on and off in groups, each with who may use it

### When not to use

- A person picking a model for one chat – use the composer's model menu
- Usage and spend per model – use Analytics

### Usage

```tsx
import { SettingsModelsScreen } from "@/components/ui/settings-models";

export default function Page() {
  return (
    <SettingsModelsScreen
      providers={providers}
      defaultChat="auto"
      defaultImage="gpt-image"
      onSave={(state) => saveModelSettings(state)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| providers | `Provider[]` |  | Providers with id, name, region (eu, global or custom), logo and their models – each model has id, name, kind (chat or image), on and access. The sample list when left out |
| defaultChat | `string` | `"auto"` | Model id of the default chat model, or auto – Auto shows a short explainer under it |
| defaultImage | `string` | `"gpt-image"` | Model id of the default image model |
| keys | `{ provider: string; masked: string; added: string }[]` | `[]` | The workspace's own API keys, already masked |
| onSave | `(state) => void` |  | Called with providers, defaults and keys whenever something changes. A switched-off default falls back – chat to Auto |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` |  | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the models load: the defaults, every provider with its models and the API keys as gray shapes in the shape of the real ones |
| empty | `boolean` |  | No models yet: the defaults on Auto, “No models yet” with a Custom model button in the models' place and “No API keys” with Add key |
| className | `string` |  | Extra class on the root |

### Accessibility

- Provider cards are buttons with aria-expanded; searching opens every card with a match
- Each model has a switch (role="switch") and an access menu labelled with the model's name
- Adding a custom model or key is a small form: Enter adds, Escape cancels; the key field is a password field
- The Model Wheel next to Auto stands still with prefers-reduced-motion; screen readers get one sentence for it

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 600px controls move under their labels, the filter takes its own line and Auto's picks go under its text
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Settings / General and Settings / Security (their rows and switches), the Model Wheel illustration, Button and Segmented Control (installed with it)

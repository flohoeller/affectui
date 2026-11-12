# Settings / Preferences (Pro)

Personal preferences with a settings sidebar: default models with Auto and the Model Wheel, language and appearance, chat tools as tiles, custom instructions the model reads with every message and the memories it kept

- Page: https://www.affectui.com/screens/settings-preferences
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/settings-preferences.json` (needs the Pro access key)
- Import: `@/components/ui/settings-preferences`

### When to use

- The preferences page of a person's settings in an AI product
- Personal defaults that sit on top of what the workspace allows

### When not to use

- Which models the workspace allows – use Settings / Models
- Name, picture and contact details – use Settings / Profile

### Usage

```tsx
import { SettingsPreferencesScreen } from "@/components/ui/settings-preferences";

export default function Page() {
  return (
    <SettingsPreferencesScreen
      preferences={preferences}
      providers={workspaceModels}
      onSave={(preferences) => savePreferences(preferences)}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| preferences | `PreferenceValues` |  | Default chat and image model, language, theme, app actions, chat tools, custom instructions (on, about, style) and memories – the sample person when left out |
| providers | `Provider[]` |  | The workspace's providers and models, as in Settings / Models – only models that are on can be picked |
| onSave | `(preferences: PreferenceValues) => void` |  | Called with all settings whenever something is saved – text fields on blur, everything else at once |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` |  | Workspace name in the sidebar |
| user | `{ name: string; avatar?: string }` |  | Account at the bottom of the sidebar |
| loading | `boolean` |  | While the settings load: the models, language, appearance, switches, chat tools, instructions and memories as gray shapes in the shape of the real ones |
| empty | `boolean` |  | Nothing saved yet: no custom instructions, and “No memories yet” with Start a chat – or Turn on memory while it's off – in the memories' place |
| className | `string` |  | Extra class on the root |

### Accessibility

- Chat tools are buttons with role="checkbox"; the appearance choice is a radio group
- Paused instructions keep their text but disable the fields, so nothing is typed into them by mistake
- Each memory has a Forget button named after it
- The Model Wheel next to Auto stands still with prefers-reduced-motion

### Responsive

- Fills its container – give it the full viewport height in your app
- Below 600px controls move under their labels and the chat tools stack
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"; colors are CSS variables on .ui-as

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell, Settings / Profile (its sidebar), Settings / General, Settings / Security and Settings / Models (their rows, switches and model pickers), the Model Wheel illustration, Button and Segmented Control (installed with it)

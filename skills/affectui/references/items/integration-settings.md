# Integration Settings (Pro)

Settings card for a connected service – on/off switch, API key, validated site address, time zone and a save bar

- Page: https://www.affectui.com/components/integration-settings
- Section: Components · Inputs
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/integration-settings.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/integration-settings-clean.json` (needs the Pro access key) – lands as `integration-settings-clean.tsx`, import from `@/components/ui/integration-settings-clean` – its docs: `integration-settings-clean.md`
- Import: `@/components/ui/integration-settings`

### When to use

- The settings of one connected service – a store, an ad account, a data source
- Forms that should only save when someone confirms, with a clear way to discard

### When not to use

- Long settings pages with many sections – split them into separate cards or pages

### Usage

```tsx
import { IntegrationSettings } from "@/components/ui/integration-settings";

export function Store() {
  return (
    <IntegrationSettings
      name="Shopify store"
      logo={<ShopifyLogo />}
      count={128}
      meta="Connected on March 4, 2026"
      defaultValues={{ siteUrl: "lumen-studio.com", timeZone: "(GMT +01:00) Berlin" }}
      onGenerateKey={() => api.createKey()}
      onSave={(values) => api.saveSettings(values)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` |  | Name of the service |
| logo | `ReactNode` |  | Logo in the white tile |
| count | `number` |  | Small number next to the name |
| meta | `string` |  | Line under the name; switching off shows a paused note instead |
| defaultValues | `Partial<IntegrationValues>` |  | enabled, siteUrl, timeZone and apiKey to start with |
| siteHint | `string` |  | Helper text under the address field |
| timeZones | `string[]` |  | Choices in the time zone picker |
| onGenerateKey | `() => string \| Promise<string>` |  | Creates a key – a random demo key without it |
| onSave | `(values) => void \| Promise<void>` |  | Called with all values from the save bar |
| onToggle | `(enabled: boolean) => void` |  | Called when the switch changes |

### Keyboard

- Space: Toggle the switch
- Tab: Move through the key actions, the address and the time zone
- Escape: Close the time zone picker

### Accessibility

- The toggle is a real switch; the address field reports invalid input and points to its hint
- A new key is announced together with the reminder to copy it

### Motion

- Switching off folds the settings away, the save bar slides open on changes – reduced motion turns this off

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: app-directory, data-table

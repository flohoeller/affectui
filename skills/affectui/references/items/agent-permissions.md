# Agent / Permissions (Pro)

What your agent may do without asking – one choice on top (Careful, Balanced, Hands-off) said in plain words, the apps it works in, the red lines that always ask, and each app with its actions grouped Reads, Changes, Needs care

- Page: https://www.affectui.com/screens/agent-permissions
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-permissions.json` (needs the Pro access key)
- Import: `@/components/ui/agent-permissions`

### When to use

- Letting people decide what an agent may do on its own – one choice for everything first, then app by app and action by action
- Showing in plain words how autonomous an agent is: what it does on its own, what it asks about, what it never does
- Red lines that must always ask, whatever the choice above

### When not to use

- Answering one request in the moment – use Permission Request or Approval Gates
- What the agent knows about you – use Agent / Memory
- Connecting apps – use Integrations

### Usage

```tsx
import { AgentPermissionsScreen } from "@/components/ui/agent-permissions";

export default function Page() {
  const [rules, setRules] = useState(initialRules);
  return (
    <AgentPermissionsScreen
      apps={connectedApps}
      rules={rules}
      onChange={(rule) => {
        setRules((l) => l.map((r) => (r.id === rule.id ? rule : r)));
        api.savePermission(rule.id, rule.level, rule.limit);
      }}
      onPreset={(preset) => analytics.track("preset", { preset })}
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| apps | `{ id; name; account?; icon? }[]` | `seven sample apps` | The connected apps, in the order their groups show – icon is a Hugeicons icon, shown in the app's color |
| rules | `{ id; app; action; detail?; icon?; level: "allow" \| "ask" \| "never"; defaultLevel?; kind?: "read" \| "write" \| "risky"; locked?; limit?: { value; unit }; week?: { done?; asked?; blocked? }; recent?: { what; outcome; at }[] }[]` |  | Every action. level is what it may do now, defaultLevel what Reset goes back to (default: the level it came in with); kind is what the presets go by; locked makes it a red line – listed under Red lines, left alone by the choice above, and never on its own; limit lets it act on its own up to an amount and ask above; week fills the row's count and the panel's numbers; recent is what happened lately – done, approved, declined or blocked. Pass a stable array (state) |
| defaultApp | `string \| null` | `"stripe"` | The app open on the right when the screen starts |
| onChange | `(rule: PermissionRule) => void` |  | Called with the whole rule when its choice or its limit changes – a preset or a group's choice calls it for every rule that moved |
| onPreset | `(preset: "cautious" \| "balanced" \| "handsoff") => void` |  | Called with a preset after the screen has set every rule by it |
| onSelect | `(appId: string) => void` |  | Called when an app is opened |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item |
| workspace | `string` | `"Fieldwork"` | The workspace in the sidebar |
| labels | `{ permissions?; intro?; autonomy?; allowLong?; askLong?; neverLong?; locked?; cautious?; balanced?; handsoff?; reads?; changes?; care?; … }` |  | Labels, e.g. for a translation |
| user | `{ name: string; avatar?: string }` | `{ name: "Alex Morgan" }` | Account at the bottom of the sidebar |
| loading | `boolean` |  | While your apps and rules load: gray rows for the apps, the red lines and the open app, in the shape of the real ones (the shared Skeleton) |
| empty | `boolean` |  | No apps connected: the Apps list shows No apps connected with a sentence on what shows up here and a Connect app button (onConnect), the red lines hide and the App panel shows nothing open |
| onConnect | `() => void` |  | Called with Connect app in the empty list (default: onNavigate("Integrations")) |
| className | `string` |  | Extra class on the root |

### Keyboard

- ← / → / ↑ / ↓: In How much it does on its own: Careful, Balanced, Hands-off – one Tab stop, the arrows pick
- Tab / Enter: Every app, red line and choice is a button – Enter opens an app on the right or a choice's menu
- ↑ / ↓ / Enter / Esc: In a choice's menu: the App Shell's menu – the arrows move, Enter picks, Esc closes and hands the focus back
- Enter / Esc: In a limit: Enter saves it, Esc puts the old amount back

### Accessibility

- The three choices are a role="radiogroup" with one Tab stop; the one that fits best is checked – picking it again puts actions changed by hand back
- Each app is one button named with what the agent does there in words – "Gmail, alex@fieldwork.co: 3 on its own · asks before 1 · never 1"
- Every action's choice is a menu button named with the action and its choice; a red line's menu leaves On its own out and says why
- A polite live region says what changed: "Issue refunds: Asks first", or a choice's new counts
- Color is never the only sign: every bar and dot sits next to its words; rings show for the keyboard only and the limit field only firms up its edge

### Motion

- One moment: picking Careful, Balanced or Hands-off glides the thin bar's parts to their new widths, the counts change in the line above it and each app's own small bar follows
- With prefers-reduced-motion they simply change

### Responsive

- Fills its container – give it the full viewport height in your app; the page keeps a readable 680px column
- Below 620px the three choices stack and the apps keep their small bars without the words; an app opens in the App Shell's sheet
- Long names and accounts end in '…' with the full text in a tooltip; an app without a logo or icon shows its first letter; a limit's field grows with its amount; dates from another year carry the year
- Touch targets grow to 36px on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-memory, permission-request, approval-gates

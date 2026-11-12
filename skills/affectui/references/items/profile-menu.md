# Profile Menu (Free)

Account card with the signed-in user, menu actions and profile setup progress

- Page: https://www.affectui.com/components/profile-menu
- Section: Components · Navigation
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/profile-menu.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/profile-menu-clean.json` – lands as `profile-menu-clean.tsx`, import from `@/components/ui/profile-menu-clean` – its docs: `profile-menu-clean.md`
- Import: `@/components/ui/profile-menu`

### When to use

- The dropdown behind the avatar in an app header
- Nudging people to finish their profile, right next to the account actions

### When not to use

- Long menus with nested levels – use a full dropdown menu with submenus
- Long onboarding flows with many steps – use a checklist like the Setup Guide instead

### Usage

```tsx
import { ProfileMenu, SettingsIcon, LogoutIcon } from "@/components/ui/profile-menu";

export function Account() {
  return (
    <ProfileMenu
      name="Lena Hartmann"
      email="lena.hartmann@fastmail.com"
      items={[
        { id: "settings", label: "Settings", icon: <SettingsIcon />, onSelect: openSettings },
        { id: "logout", label: "Logout", icon: <LogoutIcon />, onSelect: signOut },
      ]}
      setup={{ done: 3, total: 5, next: "Add a profile photo", onContinue: openProfile }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` |  | Name of the signed-in user |
| email | `string` |  | Email under the name, cut off with an ellipsis when long |
| avatar | `ReactNode` |  | Replaces the default avatar, e.g. an <img> |
| items | `ProfileMenuItem[]` |  | Actions with label, icon, optional badge and onSelect |
| setup | `ProfileSetup` |  | Profile setup progress: done, total, the next step and onContinue – leave empty to hide |
| className | `string` |  | Extra class on the card |

### Keyboard

- Tab: Move into the menu
- ↑ / ↓: Move between the actions
- Home / End: Jump to the first or last action
- Enter / Space: Run the focused action

### Accessibility

- Actions are buttons in a menu role, so screen readers announce them as menu items
- The setup bar is a progressbar with its percentage as value

### Motion

- The setup bar fills up when the card comes into view
- Reduced motion shows it at once

### Responsive

- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: progress-tracker

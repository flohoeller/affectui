# Agent / Skills (Pro)

What your agent knows how to do – your skills as calm cards with a switch, filtered by what they're for; skills to discover below whose Install fills a ring and lands among yours; and each skill with two weeks of runs, when it steps in, its steps and what it needs

- Page: https://www.affectui.com/screens/agent-skills
- Section: Screens · App screens
- Install: `npx shadcn@latest add https://www.affectui.com/r/agent-skills.json` (needs the Pro access key)
- Import: `@/components/ui/agent-skills`

### When to use

- Showing what an agent knows how to do – the skills it has, where they come from and how often they run
- Adding skills from a catalog, and switching ones off without removing them
- Answering when a skill steps in and what it needs before you turn it on

### When not to use

- What the agent may do in your apps – use Agent / Permissions
- What it knows about you – use Agent / Memory
- Connecting apps – use Integrations

### Usage

```tsx
import { AgentSkillsScreen } from "@/components/ui/agent-skills";

export default function Page() {
  const [skills, setSkills] = useState(initialSkills);
  return (
    <AgentSkillsScreen
      skills={skills}                              // installed and not – Discover shows the rest
      onInstall={(id) => api.installSkill(id)}     // a promise keeps the ring filling until it settles
      onToggle={(id, enabled) => api.setSkill(id, { enabled })}
      onRemove={(id) => api.removeSkill(id)}
      onCreate={(skill) => api.createSkill(skill)}  // from the New skill window
      onNavigate={(label) => router.push(routes[label])}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| skills | `{ id; name; description; category; icon?; tone?; source: "builtin" \| "yours" \| "community"; author?; version?; installed?; enabled?; uses?; installs?; triggers?; steps?; needs?; usedIn?: { task; at }[] }[]` |  | Every skill. Installed ones are calm cards with a switch under Installed, the rest cards with a + under Discover; the categories become filters above. triggers are things you might say that make it step in; steps what it does; daily runs per day for the last 14 days (the bars in the panel); needs the apps and rights it uses (with a way to Permissions); uses how often it ran this week; installs how many people use a community skill. Pass a stable array (state) |
| defaultSelected | `string \| null` | `"voice"` | The skill open on the right when the screen starts |
| onInstall | `(id) => void \| Promise` |  | Called with Install – the ring fills for at least 1.4 seconds and until a returned promise settles; then the skill joins Installed |
| onToggle | `(id, enabled) => void` |  | Called when a skill is switched on or off |
| onRemove | `(id) => void` |  | Called with Remove – yours and community skills; built-in ones can only be turned off |
| onCreate | `(skill: Skill) => void` |  | Called with a skill made in New skill – described to the agent (it drafts name, use and steps to check), written by hand or read from an uploaded SKILL.md; it lands among yours and opens on the right |
| onSelect | `(id) => void` |  | Called when a skill is opened |
| onNavigate | `(label: string) => void` |  | Called with the label of a sidebar item – and with "Permissions" from What it needs |
| labels | `{ skills?; installed?; discover?; install?; installing?; done?; runsWhen?; steps?; needs?; … }` |  | Labels, e.g. for a translation |
| className | `string` |  | Extra class on the root |

### Keyboard

- J / K / ← / → / ↑ / ↓: From skill to skill – through Installed, then Discover
- Enter: Open the skill on the right
- Space: On a switch: turn the skill on or off
- ↑ / ↓: In New skill: from way to way – Esc closes, ⌘ Enter writes or creates
- /: Search – Esc clears it, ↓ steps into the results
- ← / →: On the filters: from category to category

### Accessibility

- Each skill is a button named with what it does, where it comes from, how often it ran and whether it's off; the switch is a role="switch" named with the skill
- Install says what happens – "Installing Slide deck", then "Slide deck: Installed" – through a polite live region
- Rings show for the keyboard only and sit inside rows and cards; the search only firms up its edge

### Motion

- New skill opens as a window with four ways in – Describe it, Write it yourself, Upload a file, Browse skills; while the agent writes, its pixel mark twinkles
- One moment: Install becomes a ring that fills, then a check that pops in; the card leaves Discover and the skill lands among yours out of a blur with a short blue glow, scrolled into view, while the count ticks up
- The panel's two weeks of runs grow in from the baseline, bar after bar
- With prefers-reduced-motion the ring is simply full and nothing glows

### Responsive

- Your skills and Discover share one grid – tiles fill the width in as many columns as fit; the category filters scroll sideways when they don't fit
- Discover cards fill the width in as many columns as fit; one column on phones
- Below 560px everything is one column, the search folds to its icon until you type and New skill to its +
- Touch targets grow to 36px and the switch to 40 × 24 on touch screens
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19
- @hugeicons/react
- @hugeicons/core-free-icons
- App Shell (installed with it)

Related: agent-permissions, agent-memory, integrations

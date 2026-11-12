# Project Card (Pro)

A two-line project summary that quietly unfolds on hover – a progress ring with one segment per subtask, a people filter and a status picker, all linked by hover

- Page: https://www.affectui.com/components/project-card
- Section: Components · Cards
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/project-card.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/project-card-clean.json` (needs the Pro access key) – lands as `project-card-clean.tsx`, import from `@/components/ui/project-card-clean` – its docs: `project-card-clean.md`
- Import: `@/components/ui/project-card`

### When to use

- Boards, lists and sidebars where many projects or tasks sit next to each other and the details should be one hover away
- Anything with a short summary and a longer truth behind it – a project, a ticket, a deal, an agent run
- When opening a separate page or drawer would be too heavy for a quick look and a small edit

### When not to use

- Long content or forms – open a drawer or a page instead; this card is for a glance and a tick
- Dense tables – a row that grows on hover pushes everything below it around
- When the details must stay visible – show the open card as a static layout instead

### Usage

```tsx
import { ProjectCard } from "@/components/ui/project-card";

export function OnboardingCard() {
  return (
    <ProjectCard
      title="Onboarding flow"
      tasks={[
        { id: "welcome", label: "Welcome screen", done: true, assignee: "Mara" },
        { id: "workspace", label: "Workspace setup", done: true, assignee: "Jonas" },
        { id: "invite", label: "Invite teammates", assignee: "Mara" },
      ]}
      status="progress"
      due="Oct 24"
      members={[{ name: "Mara" }, { name: "Jonas" }]}
      action={{ label: "Open", onClick: () => router.push("/projects/onboarding") }}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` |  | Name of the project |
| tasks | `ProjectTask[]` |  | { id, label, done?, assignee? } – one ring segment and one row each; assignee is a member's name |
| onTasksChange | `(tasks: ProjectTask[]) => void` |  | Called with the full list after a tick. With it the card shows exactly what you pass; without it the ticks live inside the card |
| status | `string` | `first option` | Id of the chosen status |
| statuses | `ProjectOption[]` | `To do, In progress, In review, Done` | { id, label, tone? } – tone is red, amber, green, blue, violet or gray and also picks the icon; icon replaces it |
| onStatusChange | `(id: string) => void` |  | Called with the picked status |
| due | `string` |  | Ready-to-show due date, e.g. "Oct 24" – shown as "Due Oct 24" |
| members | `ProjectMember[]` |  | { name, avatar? } – the avatars in the head; hovering one shows only that person's subtasks. Initials on a soft color without an image |
| action | `{ label: string; onClick: () => void }` |  | A button on the tray of the open card, e.g. Open |
| hint | `ReactNode` | `"2 left" / "All done"` | The line on the tray while nothing is hovered |
| trigger | `"hover" \| "click"` | `"hover"` | Hover opens under the mouse; taps and the keyboard always toggle |
| open | `boolean` |  | Controlled open state |
| defaultOpen | `boolean` | `false` | Starts open when uncontrolled |
| onOpenChange | `(open: boolean) => void` |  | Called when the card opens or closes |
| className | `string` |  | Extra class on the root |

### Keyboard

- Enter / Space: On the card: opens or closes it
- Tab: Through the status, the people, the subtasks and the action
- Space: On a subtask: ticks or unticks it. On a person: keeps or releases their filter. On the status: unfolds the options
- Esc: Closes the status options first, then the card

### Accessibility

- The head is one button with aria-expanded whose name carries the summary: title, progress, status and due date
- Subtasks are checkboxes, the people are toggle buttons, the status options are a radio group
- While the card is closed, everything inside is inert – nothing hidden can be focused or read
- Focusing a subtask or a person does what hovering does, and the line on the tray is announced politely

### Motion

- Nothing travels: the head stays where it is and the list unfolds below it while it fades in
- The status options unfold in the same way, in place
- Hovering a subtask thickens its ring segment and brings in the assignee's avatar; ticking fills the circle, draws the check and turns the segment dark
- Hovering a person fades everyone else's subtasks and segments
- The line on the tray swaps with a short rise; the number in the ring pops when it changes
- With prefers-reduced-motion everything switches without movement

### Responsive

- Fills its container up to 320px. Below 290px the date drops its word ("Oct 24") and the avatars move closer; a long title is cut with an ellipsis and nothing runs under the avatars
- Touch screens: a tap opens, a tap outside closes, rows and options are taller and the assignee avatars are always visible
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- The card grows downward when it opens – in a list, give it room or lay it over the next items with position absolute in a fixed-height slot
- A task's assignee must match a member's name exactly – that is what links rows, avatars and the people filter
- More than about twelve subtasks make the ring segments too small to point at – group them first

### Requirements

- React 19

Related: progress-tracker, agent-plan, compact-breakdown

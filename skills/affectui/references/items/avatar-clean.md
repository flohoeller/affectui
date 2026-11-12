# Avatar, clean style (Free)

A person's picture or initials on a soft color of their own – rounded squares for workspaces, an agent's pixel mark that twinkles while it works, a status dot and a group that overlaps and ends in +N

- Page: https://www.affectui.com/components/avatar
- Section: Components · Data display
- Install: `npx shadcn@latest add https://www.affectui.com/r/avatar-clean.json`
- Import: `@/components/ui/avatar-clean`

### When to use

- A person next to their name: comments, members, assignees, the account menu
- A workspace, team or org – shape="square" with its initial or logo
- An AI agent – kind="agent" draws its own pixel mark in its color, twinkling while it works
- Who is on something, in little space – AvatarGroup overlaps them and ends in +N

### When not to use

- A status on its own, without a person – use the Badge
- A tool or app logo inside text – use an inline icon, like Tool Call Card does
- Picking people – use the Tag Input or a Combobox, with an avatar in each option

### Usage

```tsx
import { Avatar, AvatarGroup } from "@/components/ui/avatar-clean";

type Member = { id: string; name: string; picture?: string; online?: boolean };

export function Reviewers({ members }: { members: Member[] }) {
  return (
    <AvatarGroup size={24} max={4} aria-label={`${members.length} reviewers`}>
      {members.map((m) => (
        <Avatar key={m.id} seed={m.id} name={m.name} src={m.picture} status={m.online ? "online" : undefined} />
      ))}
      <Avatar kind="agent" seed="triage" name="Triage agent" />
    </AvatarGroup>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| name | `string` |  | Who it is – the initials (first and last word), the accessible name and the color come from it. Left out: a person outline on gray |
| src | `string` |  | The picture. The initials show while it loads and stay when it fails to load |
| size | `20 \| 24 \| 32 \| 40` | `32` | Width and height in pixels; the initials, the status dot and an agent's mark scale with it |
| shape | `"circle" \| "square"` | `"circle" (agents: "square")` | circle for people · square, a rounded square, for workspaces, teams and agents |
| status | `"online" \| "away" \| "busy"` |  | A green, amber or red dot on the corner – added to the accessible name, e.g. "Mara Lindqvist, online" |
| kind | `"person" \| "agent"` | `"person"` | agent: the agent's own 3×3 pixel mark on a white tile instead of initials – never a monogram. A src still shows its logo |
| seed | `string` | `name` | What the color and an agent's pattern are made from – pass a stable id so a rename keeps them |
| color | `string` | `blue` | agent: the mark's color – use the same color the agent has elsewhere |
| working | `boolean` |  | agent: the squares twinkle in a diagonal wave while it works |
| ...span props | `ComponentProps<"span">` |  | className, style, title, aria-label, aria-hidden, ref and the rest go to the outer <span> |
| AvatarGroup max | `number` | `4` | How many show before the rest becomes +N (99+ above 99) |
| AvatarGroup size | `20 \| 24 \| 32 \| 40` | `32` | Sets the size of every Avatar in it and of the +N |
| AvatarGroup total | `number` |  | How many there are in all, when you pass only the first few – +N counts from it |

### Accessibility

- With a name it is an image named after the person (role="img"), plus the status – "Jonas Weber, away"
- Next to the written name, pass aria-hidden so screen readers don't say the name twice; without a name it is hidden on its own
- The picture itself has an empty alt – the name is on the avatar, never read twice
- AvatarGroup is a group: give it an aria-label like "9 reviewers"; +N reads "5 more"
- The status color is never the only signal – it is part of the accessible name

### Motion

- A picture fades in once it has loaded, over the initials – no empty circle while it loads
- working: the agent's squares fade down and back in a diagonal wave, 1.2s
- With prefers-reduced-motion the picture appears at once and the mark stays still

### Responsive

- Initials are whole characters (Intl.Segmenter): accents, emoji with skin tones and flags never split; a name that starts with an emoji shows just that emoji
- "III", "Jr." and the like don't make an initial, nor do brackets or quotes in front of a word – "Christopher Montgomery III" is CM
- Right-to-left: the status dot and the overlap mirror to the other side
- The group's ring and the status ring use --ui-avtc-ring – set it to the background the avatars sit on (white by default)
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Agents never get initials, sparkles or a bot glyph – always kind="agent" with the agent's id as seed
- Pass a stable id as seed, so a person's color doesn't change when they edit their name

### Requirements

- React 19

Related: badge, collaboration-stream, comment-thread, tag-input, profile-menu

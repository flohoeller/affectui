# Commit Trail, clean style (Pro)

One line per commit on a blue trail – message, a colored tag for the kind of change and how long ago, open for who wrote it, and merges that fold the commits they brought in

- Page: https://www.affectui.com/components/commit-trail
- Section: Components · Agents
- Install: `npx shadcn@latest add https://www.affectui.com/r/commit-trail-clean.json` (needs the Pro access key)
- Import: `@/components/ui/commit-trail-clean`

### When to use

- A branch's history where people and agents both commit – who wrote what, at a glance
- A side panel or a PR page that shows recent commits, with merged branches folded away until you want them
- Live: an agent that commits while you watch – its marker turns at the top until the commit lands

### When not to use

- The change itself, line by line – use Inline Diff or Diff Timeline
- The steps an agent works through, not what it committed – use Agent Trail
- A full branch graph with many parallel lines and cross merges – this shows one branch and the branches merged into it

### Usage

```tsx
import { CommitTrail, type TrailCommit } from "@/components/ui/commit-trail-clean";

const claude = { name: "Claude", agent: true };

const commits: TrailCommit[] = [
  { id: "a41c7e2b", message: "Release 3.1", author: { name: "Mara Lind" }, time: Date.now() - 26 * 60_000, tag: "v3.1" },
  {
    id: "9be20f11",
    message: "Merge `invoice-pdf` into `main`",
    author: { name: "Tomás Reyes" },
    time: "2026-11-13T09:10:00Z",
    commits: [
      { id: "d7a90c4e", message: "Render line items as a PDF table", author: claude, added: 286, removed: 22 },
      { id: "53f1b8a0", message: "Embed fonts in invoice exports", author: { name: "Tomás Reyes" }, coAuthor: claude },
    ],
  },
  { id: "e02c6d97", message: "Fix rounding on prorated plans", author: { name: "Kai Brandt" }, kind: "fix", files: 2, added: 18, removed: 9 },
];

export function History() {
  return <CommitTrail commits={commits} branches={["main", "invoice-pdf"]} hasMore />;
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| commits | `TrailCommit[]` |  | Newest first – { id, message, author, coAuthor?, time?, tag?, files?, added?, removed?, body?, commits?, pending? } |
| author / coAuthor | `{ name; agent?; color?; avatar? }` |  | Who wrote it – shown when the commit is open, "Ines Okoro with Claude": an agent with its pixel mark before its name (in its color, blue when there is one), a person with avatar – your own icon or symbol – when you give one. The rows themselves stay quiet; screen readers hear the names on every row |
| time | `number \| Date \| string` |  | When – ms, a Date or ISO text, shown on the right as "now", 4m, 2h, 3d, 1w, 5mo, 2y and in full when open; other text shows as it is |
| commit.commits | `TrailCommit[]` |  | On a merge: the commits of the branch it brought in – the row folds them, with a chevron on hover; open, they bend off the trail as small dots with their kind and when on the right |
| message | `string` |  | One line – put branch and file names in backticks ("Merge `invoice-pdf` into `main`") and they show as light chips: a file (it has an extension) with the file icon, anything else with the branch icon |
| refs | `Record<string, string>` |  | More about the names in messages – rest the pointer on one for 0.4s and a compact dark tooltip shows above it: its icon, its name and this text (File or Branch without one) ("src/webhooks/queue.ts", "3 commits, merged by Tomás Reyes") |
| kind | `string` |  | What kind of change – a colored tag on the right, before the time: feat (Feature, green), fix (orange), refactor (violet), perf (teal), docs (blue), test (Tests, amber), chore (gray), release (pink), merge (indigo), or a kind of your own |
| kinds | `Record<string, { label?; color? }>` |  | Rename a kind or add your own with its color – { feat: { label: "New" }, ui: { label: "UI", color: "#ee3e9e" } }; a kind without a color is gray |
| tag | `string` |  | A release or tag – a small quiet chip after the message |
| files / added / removed / body | `number / string` |  | What it changed and the rest of the message – shown when the commit is open, under who and when |
| pending | `boolean` |  | Still being written: its marker's arc turns as in Agent Trail, "Committing" shimmers on the right; drop it and the commit lands – the check draws itself and the line fills |
| branches / branch / defaultBranch / onBranchChange | `string[] / string / string / (b) => void` |  | The branch, as the header's title – with two or more it opens a menu to switch. Swap commits on change |
| open / defaultOpen / onOpenChange | `string \| null` |  | Which commit is open – one at a time, a branch's commits too; the others step back |
| expanded / defaultExpanded / onExpandedChange | `string[]` |  | Which merges show their branch's commits – folded by default |
| hasMore | `boolean` |  | Older commits exist – the trail runs on past the last one and fades |
| maxHeight | `number` |  | The list scrolls past this height (px) |
| locale | `string` |  | The locale dates are written in – "en-US" by default; set it together with labels |
| labels | `Partial<CommitTrailLabels>` |  | Every word: title, empty, committing, untitled, copy, copied, with, now, switchBranch, file, branch, commits(n), files(n), landed(who, message) |
| className | `string` |  | Extra class on the root – set the color variables on it |

### Keyboard

- Tab: Moves to the branch switcher, then into the trail
- ↑ / ↓: Moves between commits – into an open branch's commits too
- Home / End: First or last commit
- Enter / Space: Opens a commit – on a merge, folds its branch's commits open or closed
- Esc: Closes the open commit, or folds the merge you are on
- Tab: In an open commit: Copy hash
- ↓ / Enter: On the branch switcher: opens the menu – ↑ ↓ Home End move, Enter picks, Esc closes and returns to the switcher

### Accessibility

- An ordered list named after the branch; each commit is a button with aria-expanded that reads its message, author, co-author and time
- A merge reads how many commits it brought; its branch's commits are a list of their own, inert while folded
- A commit still being written is not a button and reads "Claude: Committing – …"
- A polite live region says when a commit lands – "Claude committed: Retry failed webhooks"
- The branch switcher is a menu button with menuitemradio items; Copy says "Copied" once it worked
- Focus rings show for the keyboard only (:focus-visible), in light and dark

### Motion

- As in Agent Trail: a commit's check pops in and draws itself, the line to the next commit fills blue
- While an agent commits, its marker's arc goes round, "Committing" shimmers and Agent Trail's light – full at the front, fading to nothing at the back – runs up the last stretch of trail into it again and again – from the newest check, on the gray line that fills blue when the commit lands – the marker ringing once as it arrives; lines between two checks stay blue
- New commits make room; on first show the rows rise in one after another
- A merge folds open: the straight line steps aside, the branch line bends off the trail, runs past its commits and bends back
- With prefers-reduced-motion everything changes at once and the light stays off

### Responsive

- One line per commit – 32px, a branch's commit 24px, 40px and 28px on touch screens, as in Agent Trail – so a landing commit or a changing time never moves another row
- A name in a message gets a dark tooltip after a short rest on it – in the top layer, so it is never cut off; touch screens skip it
- Long messages are cut inside a name's chip ("proration.t…") instead of dropping it; tags and branches end in … with the full text on hover; every time sits in one column as wide as "00m", so the tags line up
- No commits: the header stays and a quiet "No commits yet" takes the list's place
- Right-to-left: the trail moves to the right edge and the branch line bends the other way; messages, times and tags read in their own direction while their gaps follow the list
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Give commits their hash as id – opening, folding, the live region and the landing check track them by it
- Keep messages short and in the imperative, names in backticks – "Fix rounding in `proration.ts`"
- Give each commit a kind from its message (feat, fix, refactor, perf, docs, test, chore, release) – the tags bring the color in, the trail stays blue
- Mark agents with agent: true so they get their pixel mark; a person working with an agent gets it as coAuthor; give people an avatar (an icon or symbol) to mark them in the open commit
- Put a merged branch's commits on its merge commit (commits) instead of in the main list
- Colors are variables on .ui-cmtc – --ui-cmtc-accent and --ui-cmtc-wash set the trail, --ui-cmtc-spark and --ui-cmtc-loop the light, --ui-cmtc-kind-feat … --ui-cmtc-kind-release the tags, --ui-cmtc-mark an agent alone

### Requirements

- React 19

Related: agent-trail, diff-timeline, inline-diff, collaboration-stream

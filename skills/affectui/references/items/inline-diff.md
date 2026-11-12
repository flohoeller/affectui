# Inline Diff (Pro)

AI edits to prose shown inline – struck and added words you accept or reject one by one, with keys, a popover and undo

- Page: https://www.affectui.com/components/inline-diff
- Section: Components · Agents
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/inline-diff.json` (needs the Pro access key)
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/inline-diff-clean.json` (needs the Pro access key) – lands as `inline-diff-clean.tsx`, import from `@/components/ui/inline-diff-clean` – its docs: `inline-diff-clean.md`
- Import: `@/components/ui/inline-diff`

### When to use

- An AI rewrote a piece of prose – an email, a paragraph, a product description – and people should approve each edit
- "Make it shorter", "fix the tone", "fix grammar" actions where most edits are small and scattered through the text
- Review steps in an agent flow where the result should only change with an explicit yes

### When not to use

- Code or line-based text – use a line diff with gutters instead
- Full rewrites where almost every word changes – show the new version next to the old one
- Live typing suggestions inside an editor – this reviews a finished suggestion, it isn't a text field

### Usage

```tsx
import { InlineDiff } from "@/components/ui/inline-diff";

export function ReviewRewrite({ draft, rewrite }: { draft: string; rewrite: string }) {
  return (
    <InlineDiff
      label="Suggested by AI · Make it shorter"
      original={draft}
      suggested={rewrite}
      onChange={(text) => saveDraft(text)}
      onDone={(text) => setFinal(text)}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| original | `string` | `""` | The text as it is now |
| suggested | `string` | `""` | The text the AI suggests – diffed word by word against original |
| changes | `DiffSegment[]` |  | Pre-computed segments ({ type: "equal", text } or { type: "change", remove, insert }) instead of original and suggested |
| onChange | `(text: string) => void` |  | Called on every decision and undo with the text so far – pending changes keep the original words |
| onDone | `(text: string) => void` |  | Called when the last pending change is decided, with the final text |
| label | `string` |  | Small line on the gray tray above the card, e.g. "Suggested by AI · Make it shorter" |
| ref | `Ref<InlineDiffHandle>` |  | highlight(index | null), accept(index), reject(index), acceptAll(), rejectAll(), undo(), reset() |
| className | `string` |  | Extra class on the root |

### Keyboard

- Tab / Shift+Tab: Move between pending changes
- ‹ / ›: Toolbar arrows: highlight the previous / next pending change (wrapping around) and open its popover
- Y / Enter: Accept the focused change and move to the next one
- N / Backspace: Reject the focused change and move to the next one
- Esc: Leave the change or clear the arrow highlight

### Accessibility

- Every pending change is a focusable button labelled like "Suggestion 2 of 4: replace “available” with “live”. Press Y to accept, N to reject"
- Removed words are a <del>, new words an <ins>; the side that was dropped is hidden from screen readers once decided
- Each decision, Accept all, Reject all and Undo are announced in a polite live region with the number left
- After the last decision focus moves to Undo, so the keyboard is never stranded; the hidden toolbar is inert
- Popover buttons are labelled and keep focus on the change; visible focus rings throughout
- The prev/next arrows never steal focus: a focused change hands focus to the next one, otherwise the change is highlighted while focus stays on the arrow
- Deleted words are red and struck, added words green – color is never the only cue (strike-through, <del> and <ins>)

### Motion

- Accepting shrinks the struck words to nothing while the green tint fades and the new words settle into the text
- Rejecting does the opposite – the new words shrink away, the strike-through and red tint fade
- The popover fades up above a change and glides from one change to the next
- The arrows only scroll the page when the next change is out of view (smoothly, or instantly with reduced motion)
- The toolbar cross-fades into "All changes reviewed" and the check draws itself
- With prefers-reduced-motion every change happens instantly

### Responsive

- Fills its container; the paragraph wraps freely and changes wrap across lines with their tints
- The popover stays inside the card horizontally, down to 320px wide
- Below 400px the prev/next arrows step aside; on touch screens the popover buttons grow and drop the key hints
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Notes for AI

- Pass the user's text as original and the model's rewrite as suggested – diffWords groups adjacent removals and insertions into one change
- Ask the model for a rewrite that keeps unchanged sentences verbatim; the fewer stray edits, the easier the review
- Write the result back with onDone (or onChange for drafts); undecided changes keep the original words
- diffWords is exported, so you can count edits or build the same segments on the server

### Requirements

- React 19

Related: writing-assistant, change-summary, approval-card

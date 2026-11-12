# affectUI review checklist

Run this before you finish any affectUI task. Copy it into your response, check every line against the code you
wrote, and fix each failure. Mark a line n/a when it can't apply (no dark mode in the app, nothing installed). Then run it again. Stop when every line passes or you have told the user why one cannot.

## 1. Automated sweeps

Run these from the project root (adjust `src/` and the `ui` folder to the project's `components.json` aliases).
The globs are quoted so zsh runs them too; an error message is not a pass. Each hit is a fix unless the user asked for it.

```bash
# Installed affectUI files stay as they came – change props and content, never the files
git diff --stat -- src/components/ui

# Access keys never land in the code
grep -rnE "aui_[A-Za-z0-9]{8,}" --exclude-dir=node_modules --exclude-dir=.git .

# Demo content copied from a reference and left in (add the demo names of the items you used)
grep -rnE "Searching the web|Reading sources|Draft a short update|Launch the new pricing page|Compare five competitors|Report on LLM API|Opus 5\.5|Acme" src --include="*.tsx" | grep -v components/ui

# Restyling an affectUI item from the outside
grep -rnE "\[data-ui|\.ui-[a-z]+-" src --include="*.css" --include="*.scss" | grep -v components/ui

# Hand-made rings or halos next to affectUI items (they bring their own focus ring)
grep -rnE "outline:|box-shadow: *0 0 0|ring-[0-9]" src --include="*.css" --include="*.tsx" | grep -v components/ui

# Classes or helpers you removed – each must have no other users left
grep -rn "<removed class or function name>" src
```

Then run the project's type check (`tsc --noEmit` or its build), and its lint script if it has one.

## 2. Review

```
affectUI review:
Choice
- [ ] Every spot uses the item the Decision rules name, and its "When not to use" doesn't apply
- [ ] Nothing hand-built is left next to the item that replaced it (old spinner, old JSON, old buttons)
- [ ] One style for the whole app: only <slug> files or only <slug>-clean files (items that exist in one style only aside)
- [ ] Pro items only with the access key set up; otherwise the Free alternative and one line about Pro

Props and data
- [ ] Only props from references/items/<slug>.md (or the installed file's props type); tsc passes
- [ ] Statuses, timers, costs, steps and labels come from real app state, not demo data
- [ ] Labels name what really happens (no "Searching the web" in an app that doesn't search)
- [ ] Costs and tokens are each node's own, not pre-summed; times in the unit the reference asks for
- [ ] Callbacks do the real thing (approve calls the backend, regenerate regenerates) or are left out; buttons an
      item always shows (e.g. Agent Tree's Retry) are wired, or the user is told they do nothing

Look and motion
- [ ] The item's own CSS is untouched; no Tailwind or wrapper styles that restyle it
- [ ] One animated item per area (a message, a card, a panel, the composer); none side by side
- [ ] Colors stay quiet: no colored dots, rings or backgrounds added around the items
- [ ] No duplicate information (a progress bar next to an item that shows progress, a count it already shows)
- [ ] No extra card or border wrapped around an item that already is a card
- [ ] The item sits on the page's grid; no margins added inside it

States
- [ ] Loading: the item's own running state, or the page's skeleton before data exists
- [ ] Empty: the page shows a next step instead of an empty item
- [ ] Error: failed calls show as failed in the item (status "failed" / "error" with the message)
- [ ] Decisions stay visible after they are made (approved, denied, edited)
- [ ] Dark mode: the item switches with the app (class "dark" or data-theme="dark" on an ancestor)
- [ ] Brand: colors, font and radius come from the `--aui-` design tokens in the global CSS, not from edits or per-item overrides
- [ ] Every color token set on `:root` also has a value for dark mode (or points at a variable that switches on its own)

Accessibility
- [ ] Keyboard handling, labels and reduced motion are the item's own, not overridden
- [ ] Items that need a name got one (aria-label on segmented controls, titles on approvals)
```

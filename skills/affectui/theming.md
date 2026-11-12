# Theming: the project's brand on affectUI

affectUI items read a small set of shared design tokens before their own
defaults. Set the tokens once in the project's global CSS and every item that
reads them follows, in light and dark. A token that isn't set keeps the
affectUI default, so you can start with one (usually `--aui-primary`).

## The tokens

| Token | Used for |
| --- | --- |
| `--aui-font` | Font family of every component |
| `--aui-font-mono` | Code, keys, IDs and numbers set in mono |
| `--aui-radius` | Controls: fields, buttons, selects – small and large sizes follow it |
| `--aui-radius-sm` | Small parts: chips, tags, keys, menu rows |
| `--aui-radius-lg` | Cards, panels, menus and dialogs |
| `--aui-ink` | Text, labels and titles |
| `--aui-muted` | Hints, icons and second lines |
| `--aui-placeholder` | Placeholders and the faintest text |
| `--aui-surface` | Fields and cards |
| `--aui-subtle` | Gray layers behind cards, hover washes, chip fills |
| `--aui-overlay` | Menus, popovers and dialogs |
| `--aui-border` | Hairline edges at rest |
| `--aui-border-strong` | Edges on hover and focus, unchecked boxes |
| `--aui-primary` | Primary buttons, checked boxes and switches, the send button |
| `--aui-on-primary` | Text and icons on the primary fill |
| `--aui-focus` | Keyboard focus ring – keep it at 3:1 contrast or more |
| `--aui-danger` | Errors, failed runs, destructive actions |
| `--aui-danger-soft` | Background of error badges and notices (rolling out) |
| `--aui-warning` | Needs attention, waiting for you, limits close |
| `--aui-warning-soft` | Background of warning badges and notices (rolling out) |
| `--aui-success` | Done, connected, copied |
| `--aui-success-soft` | Background of success badges and notices (rolling out) |
| `--aui-info` | Running, live, informational |
| `--aui-info-soft` | Background of info badges and notices (rolling out) |
| `--aui-blue` | Palette: info, running – for dots, bars, charts and icons |
| `--aui-green` | Palette: success, done |
| `--aui-amber` | Palette: waiting, queued |
| `--aui-orange` | Palette: warning, needs you |
| `--aui-red` | Palette: danger, failed |
| `--aui-pink` | Palette: category color |
| `--aui-purple` | Palette: category color |
| `--aui-teal` | Palette: category color |
| `--aui-cyan` | Palette: category color |
| `--aui-shadow-card` | Edge and lift of cards and fields |
| `--aui-shadow-popover` | Menus, popovers and dialogs above the page |
| `--aui-ease` | Easing of enter, glide and morph animations |

**Which items read them:** every component, block and screen, in both styles
(classic and clean), light and dark. Each reads a token only where its meaning
fits – a card's shadow, a menu's background, a primary button – and keeps its
own value everywhere else: company logos, illustrations and mock app screens,
lift shadows, inverted tooltips and other special shades stay as they are. The
`-soft` status backgrounds are still rolling out: items tint them from the
palette color today (`color-mix(in srgb, var(--aui-red) 10%, transparent)`).
Check the item's reference file or its source: a component reads the tokens
when its CSS contains `var(--aui-`. Items installed before the tokens existed need a
reinstall to pick them up.

## Two ways in

- **The theme file** (best for a project without a design system yet):
  `npx shadcn@latest add https://www.affectui.com/r/affectui-theme.json` writes
  `styles/affectui-theme.css` – every token commented out with the clean and
  classic defaults and a dark block. Import it once in the global CSS
  (`@import "../styles/affectui-theme.css";`) and uncomment only what you set.
  Ask before installing, like any affectUI item.
- **A block in the global CSS** (best when the project already has shadcn/ui
  or its own variables): the steps and blocks below.

Tokens marked *rolling out* are defined but not yet read by many items; set them
anyway when the brand needs them – items pick them up as they move over.

## Steps

1. **Find the global CSS** the app already loads: `app/globals.css`,
   `src/index.css`, `src/app.css` or the file `components.json` names under
   `tailwind.css`. Write into that file; never create a second global stylesheet.
2. **Find where the brand lives**, in this order:
   - shadcn/ui variables (`--primary`, `--foreground`, `--border`, `--radius` …)
     in that CSS file → map to them (below), so the palette stays in one place
   - other CSS variables or a Tailwind theme with brand colors → map to those
   - a color, font or radius the user named → write the values directly
   - nothing → ask for the brand color once; set only `--aui-primary` and
     `--aui-focus` from it
3. **Write one `:root` block, and a dark block** under the selector the app uses
   for dark mode (`.dark` for shadcn and `next-themes`, `[data-theme="dark"]`
   otherwise). **Every color token you set on `:root` needs a dark value too** –
   a token on `:root` replaces the items' built-in dark colors, so a dark
   `--aui-ink` set only there leaves dark text on dark fields. The exception:
   tokens that point at variables which switch on their own (shadcn's), and
   `--aui-font` / `--aui-radius`. Put both right after the project's own variables, with a one-line
   comment `/* affectUI design tokens */`. Only set tokens you have a value for.
4. **Check contrast:** `--aui-ink` on `--aui-surface` at least 4.5:1,
   `--aui-focus` against the page at least 3:1. A brand color too light for a
   focus ring: use a darker shade of it.
5. **Report** the block you wrote, which installed items read the tokens, and
   which ones need a reinstall.

## shadcn/ui with Tailwind v4 (OKLCH or hex values)

The variables hold whole colors, so they pass straight through:

```css
/* affectUI design tokens */
:root {
  --aui-font: var(--font-sans);
  --aui-radius: var(--radius);
  --aui-ink: var(--foreground);
  --aui-muted: var(--muted-foreground);
  --aui-placeholder: var(--muted-foreground);
  --aui-surface: var(--background);
  --aui-subtle: var(--muted);
  --aui-overlay: var(--popover);
  --aui-border: var(--border);
  --aui-border-strong: var(--input);
  --aui-primary: var(--primary);
  --aui-on-primary: var(--primary-foreground);
  --aui-focus: var(--ring);
  --aui-danger: var(--destructive);
}
```

shadcn sets its dark values on `.dark`, and these references follow them – no
dark block needed. Drop `--aui-font` when the project has no `--font-sans`.

## shadcn/ui with Tailwind v3 (bare HSL numbers like `222 47% 11%`)

Wrap every color in `hsl()`:

```css
/* affectUI design tokens */
:root {
  --aui-radius: var(--radius);
  --aui-ink: hsl(var(--foreground));
  --aui-muted: hsl(var(--muted-foreground));
  --aui-placeholder: hsl(var(--muted-foreground));
  --aui-surface: hsl(var(--background));
  --aui-subtle: hsl(var(--muted));
  --aui-overlay: hsl(var(--popover));
  --aui-border: hsl(var(--border));
  --aui-border-strong: hsl(var(--input));
  --aui-primary: hsl(var(--primary));
  --aui-on-primary: hsl(var(--primary-foreground));
  --aui-focus: hsl(var(--ring));
  --aui-danger: hsl(var(--destructive));
}
```

Tell the formats apart by reading `--primary`: a value with `oklch(`, `#` or
`rgb(` is v4 style; three bare numbers are v3 style.

## No design system: values from the user

```css
/* affectUI design tokens */
:root {
  --aui-primary: #4f46e5;
  --aui-focus: rgba(79, 70, 229, 0.6);
  --aui-radius: 10px;
}

.dark {
  --aui-primary: #a5b4fc;
  --aui-on-primary: #1e1b4b;
}
```

## Don't

- Don't edit the installed component files to change colors.
- Don't override an item's own `--ui-<prefix>-…` variables for brand colors –
  that is for one-off tweaks of a single item; the brand goes into the tokens.
- Don't wrap items in Tailwind color classes; they don't reach inside.
- Don't set tokens the project has no value for – the defaults are tuned.

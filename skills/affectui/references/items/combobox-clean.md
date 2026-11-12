# Combobox, clean style (Pro)

Pick one or many from a searchable, grouped list – chips with avatars, highlighted matches, create-on-the-fly and full keyboard support

- Page: https://www.affectui.com/components/combobox
- Section: Components · Inputs
- Install: `npx shadcn@latest add https://www.affectui.com/r/combobox-clean.json` (needs the Pro access key)
- Import: `@/components/ui/combobox-clean`

### When to use

- Assigning people, labels, tags or projects – anything picked from a list that's too long to scan
- Filters where several values can apply at once, like owners or statuses
- Tag fields that should also accept new values (creatable)

### When not to use

- Up to five fixed choices – checkboxes or a segmented control show them all at once
- Free text with no list behind it – use a plain input
- Running actions rather than picking values – use the command menu

### Usage

```tsx
import { Combobox, type ComboboxOption } from "@/components/ui/combobox-clean";

const people: ComboboxOption[] = [
  { value: "maya", label: "Maya Chen", hint: "Product Designer", avatar: true, group: "Design" },
  { value: "sara", label: "Sara Okafor", hint: "Staff Engineer", avatar: "/avatars/sara.jpg", group: "Engineering" },
  { value: "elif", label: "Elif Yilmaz", hint: "Head of Product", avatar: true, group: "Product" },
];

export function Reviewers() {
  const [reviewers, setReviewers] = useState<string[]>(["maya"]);
  return (
    <Combobox
      label="Reviewers"
      options={people}
      value={reviewers}
      onChange={setReviewers}
      placeholder="Add reviewers…"
      maxVisibleTags={4}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `{ value, label, hint?, avatar?, color?, icon?, group?, keywords? }[]` |  | The list. avatar is an image URL or true for initials; options with the same group are listed under one title |
| multiple | `boolean` | `true` | Pick many (chips) or one – one closes the list after picking |
| value | `string[]` |  | Controlled values (also for single choice, with at most one entry) |
| defaultValue | `string[]` | `[]` | Starting values when uncontrolled |
| onChange | `(value: string[], options: ComboboxOption[]) => void` |  | Called on every pick, removal or creation |
| placeholder | `string` | `"Search…"` | Shown while nothing is picked |
| creatable | `boolean` | `false` | Offer a create row when no option matches the typed text exactly |
| onCreate | `(text: string) => ComboboxOption \| void` |  | Builds the new option – defaults to { value: text, label: text } |
| createLabel | `(text: string) => string` | `Create “…”` | Text of the create row, e.g. Invite “…” |
| maxVisibleTags | `number` |  | An upper limit for the chips. The field always stays one line – chips that don't fit go into a "+3" chip on their own |
| label | `string` |  | Visible label above the field (also names the list) |
| defaultOpen | `boolean` | `false` | Open the list right away |
| emptyText | `string` | `"No results"` | Shown when nothing matches |
| className | `string` |  | Extra class on the root |

### Keyboard

- ↑ / ↓: Open the list, then move between rows
- ↵: Pick or unpick the active row (or create)
- ⌫: In the empty field: highlight the last chip, press again to remove it
- Esc: Close the list; when closed, clear the typed text
- Tab: Close the list and move on

### Accessibility

- Follows the ARIA combobox pattern: the input has role combobox with aria-expanded, aria-controls and aria-activedescendant; the list is a listbox with grouped options
- Picked rows carry aria-selected, the listbox is aria-multiselectable in multiple mode
- Picks and removals are announced in a polite live region, together with the count
- Focus stays in the input while clicking rows and chip × buttons; the field shows a blue focus ring

### Motion

- Chips grow in with a small pop and fold away after a short flash; the field stays one line and the "+N" count rolls when chips no longer fit
- A gray highlight follows the active row with a short, crisp move and fades out when the pointer leaves the list; the popover with its count row glides to its new height while filtering
- Blue check marks pop in with a gentle spring; the "+3" chip and the count roll up or down
- With prefers-reduced-motion everything switches instantly

### Responsive

- The list is as wide as the field, so it always fits the screen
- Chips wrap onto new lines and long names truncate – works down to 320px
- Touch screens get 44px rows, bigger chip buttons and 16px input text (no iOS zoom)
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: filter-menu, command-menu, integration-picker

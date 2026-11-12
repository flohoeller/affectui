# Pagination (Free)

Pages of a long list – the range you see, previous and next, page numbers with … between them and rows per page, tabular numbers that keep the row still from 1 page to 10,000

- Page: https://www.affectui.com/components/pagination
- Section: Components · Navigation
- Install, classic style: `npx shadcn@latest add https://www.affectui.com/r/pagination.json`
- Install, clean style: `npx shadcn@latest add https://www.affectui.com/r/pagination-clean.json` – lands as `pagination-clean.tsx`, import from `@/components/ui/pagination-clean` – its docs: `pagination-clean.md`
- Import: `@/components/ui/pagination`

### When to use

- Under a table or list that loads one page at a time: runs, logs, eval cases, invoices
- When people need to know how much there is – "1–25 of 1,284" – and jump to the first, last or a nearby page
- With pageSizes, when some want to see more rows at once

### When not to use

- A feed people read top to bottom – load more as they scroll instead
- Where a page sits in a hierarchy – use the Breadcrumb
- A few views of the same thing – use the Segmented Control
- A handful of rows – show them all

### Usage

```tsx
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

export function RunsFooter({ total }: { total: number }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  return (
    <Pagination
      page={page}
      onPageChange={setPage}
      total={total}
      pageSize={pageSize}
      pageSizes={[25, 50, 100]}
      onPageSizeChange={setPageSize}
    />
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| page | `number` |  | Required. The page shown, from 1 – kept between 1 and the last page |
| onPageChange | `(page: number) => void` |  | Required. Called with the new page from the arrows, a number or a new size |
| total | `number` |  | All rows. Shows the range ("1–25 of 1,284", "0 of 0" when empty) and works out the pages |
| pageSize | `number` | `20` | Rows on a page |
| pageCount | `number` |  | The number of pages when you don't know the rows – the range becomes "Page 3 of 12" |
| pageSizes | `number[]` |  | Shows Rows per page with these sizes (the current one is added when it's missing) |
| onPageSizeChange | `(pageSize: number) => void` |  | A new size was picked. onPageChange follows with the page that holds the first row you saw |
| siblings | `number` | `1` | Page numbers on each side of the current one; with the first, the last and two … that makes 2 × siblings + 5 slots |
| compact | `boolean` | `false` | Only the range and the arrows – no page numbers |
| disabled | `boolean` | `false` | While rows load: everything stays where it is, nothing can be pressed |
| aria-label | `string` | `"Pagination"` | Names the navigation landmark – say which list, when a page has two |
| ...nav props | `ComponentProps<"nav">` |  | className, style, ref and the rest go to the <nav> |

### Keyboard

- Tab: Moves through Rows per page, the arrows and the numbers
- Enter / Space: Goes to that page – the focus follows the page to where its number is now

### Accessibility

- A <nav> landmark around a list of real buttons: Previous page, Page 1 … Page 52, Next page
- The page you are on is marked aria-current="page"
- At the first or last page the arrow is aria-disabled, not disabled – it keeps the focus, so Tab doesn't jump to the top
- The range is a polite live region, so a screen reader hears "26–50 of 1,284" after each move; the … are hidden
- Rows per page is a native <select> with its label – the phone's own picker opens on touch
- The ring shows only under keyboard focus (:focus-visible), never after a click

### Motion

- Only soft color changes on hover – the numbers never move, so nothing animates

### Responsive

- Tabular numbers and a fixed count of slots, each as wide as the last page's number: the row keeps its width from page 1 to 10,000
- When the row is too narrow for the numbers, only the range and the arrows stay; the range and the pager wrap onto two lines before that
- Touch screens get 40px buttons and 15px text
- Right to left: the arrows turn round
- Dark mode built in: switches when an ancestor (usually <html>) has the class dark or data-theme="dark"

### Requirements

- React 19

Related: data-table, breadcrumb, select, segmented-control

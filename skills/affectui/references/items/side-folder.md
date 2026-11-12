# Side Folder (Free)

Glassy blue folder on its side, documents sliding out to the right as the pocket swings open on hover

- Page: https://www.affectui.com/illustrations/side-folder
- Section: Illustrations · Card illustrations
- Install: `npx shadcn@latest add https://www.affectui.com/r/side-folder.json`
- Import: `@/components/ui/side-folder`

### When to use

- Feature cards about files, uploads, storage or a knowledge base; empty states for documents
- Bento grids that need a calm, friendly illustration above the text

### When not to use

- Showing real files – the documents are decorative and contain placeholder lines only
- Dark sections – the folder and documents are drawn for a light theme

### Usage

```tsx
import { SideFolder } from "@/components/ui/side-folder";

export function FeatureCard() {
  return (
    <article style={{ maxWidth: 360 }}>
      <SideFolder />
      <h3>Card title</h3>
      <p>Short description of the feature.</p>
    </article>
  );
}
```

### Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | `"Blue folder on its side…"` | Accessible description of the illustration |
| className | `string` |  | Extra class on the root, e.g. for width or margins |

### Accessibility

- Exposed as one image with a descriptive label; the folder parts inside are hidden from screen readers
- The hover effect is purely decorative, nothing needs to be reached with the keyboard

### Motion

- Hover the folder: the frosted pocket swings forward on its hinge and each document slides out to the right on its own
- With prefers-reduced-motion the changes happen instantly

### Responsive

- Transparent background, so it sits on any light surface
- Keeps a 3 : 2 aspect ratio and scales to the width of its container – every detail is sized in container units

### Requirements

- React 19

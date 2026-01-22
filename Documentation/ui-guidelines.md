UI Guidelines
===

This document outlines the mandatory styling and UI development standards for the Dashore Incubator project.

General Principles
---

- **Consistency**: All UI elements must follow the project's established design patterns.
- **Accessibility**: Compliance with WCAG 2.1 Level AA is mandatory.
- **Themability**: Use CSS variables for all colors and spacing to ensure the application remains easily re-themable.
- **Modern Standards**: Leverage Tailwind CSS 4.0 features and modern CSS functions (like `oklch`).

Component Architecture
---

### Shadcn/UI First

We use **Shadcn/UI** as our primary component library.

- Always check if a required component exists in the `src/components/ui` directory before building a custom one.
- If a new Shadcn/UI component is needed, add it using the CLI: `bunx shadcn@latest add [component-name]`.
- Custom components should be built by composing Shadcn/UI primitives and following their established patterns (e.g., using `cn()` utility for class merging).

### Hardcoded Styling

Hardcoded values for colors, spacing, and shadows are **HEAVILY discouraged**.

- **Colors**: Use semantic theme variables from `globals.css` (e.g., `text-muted-foreground` instead of `text-zinc-500`).
- **Spacing**: Use Tailwind spacing scale (`p-4`, `m-2`) or theme variables if available.
- **Shadows**: Use theme-defined shadows (`shadow-sm`, `shadow-md`).

Theming & Globals
---

Our theme is defined in `src/app/globals.css` using Tailwind 4.0's `@theme` directive and `oklch` color functions.

### Color Variables

All colors must be derived from the CSS variables defined in `:root` and `.dark` blocks:

- `--background` / `--foreground`: Base page colors.
- `--primary` / `--primary-foreground`: Primary action colors.
- `--secondary` / `--secondary-foreground`: Secondary action colors.
- `--muted` / `--muted-foreground`: For less prominent elements.
- `--accent` / `--accent-foreground`: For highlighting and hover states.
- `--destructive` / `--destructive-foreground`: For dangerous actions.
- `--border`, `--input`, `--ring`: For UI structure and focus states.

### Updating the Theme

To update the theme or add new variables:
1. Modify the variable values in `src/app/globals.css`.
2. Ensure both light mode (`:root`) and dark mode (`.dark`) are updated to maintain contrast and readability.

Accessibility (WCAG)
---

- **Contrast**: Ensure text-to-background contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).
- **Semantics**: Use appropriate HTML elements (`<button>`, `<nav>`, `<main>`).
- **Aria Attributes**: Use Radix-based components (via Shadcn/UI) which provide robust ARIA support out of the box. Ensure `aria-label` and other attributes are correctly applied to custom elements.
- **Keyboard Navigation**: All interactive elements must be focusable and operable via keyboard.

Testing
---

Thorough testing of UI components and user flows is mandatory.

- **Unit Tests**: Test complex component logic.
- **Integration Tests**: Verify that components work together as expected.
- **Accessibility Testing**: Use automated tools (like Axe) and manual keyboard/screen reader testing to ensure compliance.

Examples
---

### Correct (Using Theme Variables)

```tsx
<div className="bg-card text-card-foreground p-4 rounded-lg border border-border shadow-sm">
  <h2 className="text-primary font-bold">Themed Header</h2>
  <p className="text-muted-foreground">This uses semantic variables.</p>
</div>
```

### Incorrect (Hardcoded Values)

```tsx
// AVOID THIS
<div className="bg-white text-[#333] p-[15px] border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
  <h2 className="text-blue-600 font-bold">Hardcoded Header</h2>
  <p className="text-zinc-500">This is hard to retheme.</p>
</div>
```

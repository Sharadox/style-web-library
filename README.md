# @sharadox/style-web-library

Styles (what other projects call themes) for websites, with **several independent style groups at once**: color (Black, White, Midnight…), corners (sharp, rounded), font family, and so on. Each group has its own options, its default, an optional **System** choice that follows the device's light or dark setting, and a remembered manual choice. Everything is applied before the first paint, so the page never flashes the wrong style.

## Install

```sh
pnpm add @sharadox/style-web-library
```

## Use

```ts
// content/style.ts
import { defineStyles } from "@sharadox/style-web-library/definition";

export const STYLES = defineStyles({
  groups: [
    {
      name: "color",
      defaultChoice: "black", // or "system" to follow the device
      systemDefaults: { dark: "black", light: "white" },
      options: [
        { name: "black", scheme: "dark", palette: { background: "#000", foreground: "#fff" } },
        { name: "white", scheme: "light", palette: { background: "#fff", foreground: "#000" } },
      ],
    },
    {
      name: "corner",
      defaultChoice: "rounded",
      options: [
        { name: "sharp", palette: { radius: "0" } },
        { name: "rounded", palette: { radius: "12px" } },
      ],
    },
  ],
});
```

```tsx
// src/app/[locale]/layout.tsx: every option's CSS variables, and the no-flash script
<html lang={lang} suppressHydrationWarning>
  <head><StyleScript configuration={STYLES} /></head>
```

```tsx
// A switch for one group
const { choice, choices, choose } = useStyle(STYLES, "color");
choices.map((entry) => (
  <button role="radio" aria-checked={choice === entry.name} onClick={() => choose(entry.name)}>
    …
  </button>
));
```

CSS uses each palette's keys as variables (`var(--background)`, `var(--radius)`). The `<html>` element carries `data-style-<group>` (the option in use) and `data-style-<group>-choice` (the visitor's choice).

## API

| Import           | Export                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `…/definition`   | `defineStyles(configuration)` (validated), `resolveOption`, `findGroup`, `findOption`, `SYSTEM_STYLE`, `styleAttribute`, `styleChoiceAttribute`, `styleStorageKey`                       |
| `…/style-script` | `<StyleScript configuration>`, `styleScript(configuration)` (the inline script); it also renders `StyleKeeper`, so styles survive navigations that replace `<html>` (switching language) |
| `…/style-sheet`  | `styleSheet(configuration)` (the CSS)                                                                                                                                                    |
| `…/use-style`    | `useStyle(configuration, group)` → `{ choice, style, choices, choose }`                                                                                                                  |
| `…/style-choice` | `styleChoices(group)`: switch order (light options, System, dark options)                                                                                                                |
| `…/apply`        | `applyStyles`, `styleApplyData` (used by the script)                                                                                                                                     |

**Choosing:**

- Choosing a group's default forgets the stored choice, and any other choice (including System) is remembered in browser storage under `style-<group>` (or `storageKey`).
- Unknown stored values fall back to the default.
- With System, the page follows the device and other tabs live.

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).

# Content and engineering maintenance

[简体中文](maintenance.zh.md) · [Back to README](../README.en.md)

## Products and translations

`src/content/products.ts` is the source of truth for product content. Each product’s `locales.zh` and `locales.en` contain names, taglines, descriptions, benefits, steps, use cases, FAQs, and SEO copy. Shared navigation and home page text live in `src/content/ui.ts`.

Each product’s `homeHeadline` contains the two home page headline segments, with the second segment accented. `homeDescription` is its shorter home page introduction, while the product detail page uses `tagline` and `description`. The home page’s `ui.home.closingParts` contains a prefix, accented brand name, and punctuation, and must agree with the complete `closingTitle`. Update both languages together and check line wrapping on narrow screens and longer English words.

When a product fact changes, update both languages and the [product evidence record](product-evidence.md). Keep corresponding entries aligned in meaning and order while writing naturally in each language. `name` is a display name, while `id` is the stable route identifier. A name change should not casually change the route.

Chinese routes use `/zh/` and English routes use `/en/`, with independently generated HTML. An explicit English URL stays in English. Language preference applies to the root entry and deliberate switching. Language links use matching product identifiers and stable section IDs, so verify both when sections change.

## Enabling or updating downloads

Each product’s `downloads` array contains its platform, bilingual label, URL, and optional system requirements, version, architecture, and checksum.

```ts
{
  id: 'qcopilots-windows',
  platform: 'windows',
  label: { zh: 'Windows', en: 'Windows' },
  url: null,
}
```

Replace `url: null` with a verified HTTPS release address to enable that entry. Fill in requirements, architecture, version, and checksum only when the corresponding release supports those facts. An empty URL renders a status, not an empty link or a `#` placeholder.

QCopilots packages are provided by the product maintainer, and the website is awaiting their links. Do not substitute upstream QGIS downloads or infer custom package compatibility from QGIS platform categories. QCopilots-Search currently links to its latest GitHub Releases page, avoiding hardcoded asset filenames that become stale.

## Adding a third product

1. Add a stable lowercase identifier to `ProductId`, such as `qcopilots-example`.
2. Add a registry entry satisfying `Product`, with complete Chinese and English copy, downloads, image descriptions, and model or data handling information.
3. Put the icon and illustrations in `public/images/`, reference them with `/images/` paths, and record their origin in [assets](assets.md).
4. Update featured home page use cases in both languages when needed. Review whether navigation and home page layout still suit the product count.
5. Run content checks, both path builds, and browser checks. Verify both localized product URLs, downloads, and SEO metadata.

The shared product page is generated from the registry, so do not copy an entire page. Extend the shared types and components when a genuinely different content structure is needed, rather than hardcoding it into one product or language.

## Replacing visual assets

Preserve product icon proportions. Prefer WebP illustrations exported near their actual display size, with accurate alternative text. Do not place essential navigation, headings, or actions only inside images. The real interface remains HTML.

Current product visuals are original illustrations, not running application screenshots, and retain the “Illustrative preview / 界面示意” label. When replacing one with a real screenshot, record its product version, origin, and publication permission, check for private content or credentials, then update the caption. Never describe an AI-generated window as an actual screenshot.

The selected reference is stored in `docs/design/selected-homepage.png`. It guides the visual direction, while the website also needs responsive layouts, keyboard support, and readable real content. QA records should describe material differences and why they exist, not just record that screenshots were created.

## Runtime and dependency updates

Keep Node and npm versions consistent across `.node-version`, `package.json`, setup tool locks, and GitHub Actions. Caddy version, platform archives, and checksums are pinned too. Verify official sources and each platform’s archive and checksum before running the three-platform CI.

Application dependencies use fixed versions and a committed `package-lock.json`. Use `npm ci` for routine installs and regenerate the lockfile only for dependency updates. Do not fix a build by modifying `node_modules/`. Check licensing and visual changes when updating fonts or icons.

## Validation and publishing

Routine commands:

```bash
bash scripts/site.sh check
bash scripts/site.sh build
```

On Windows, use `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1` instead of the Bash entry. Direct npm commands require a terminal using the pinned Node/npm versions, or the repository’s portable Node directory added to that terminal’s temporary PATH. Setup does not change the global environment.

| Check                          | npm command or workflow                        |
| ------------------------------ | ---------------------------------------------- |
| Astro types and content fields | `npm run check`                                |
| Code and formatting            | `npm run lint`, `npm run format:check`         |
| Unit tests                     | `npm test`                                     |
| Built links, assets, and SEO   | `npm run test:built`, after a production build |
| Browsers and accessibility     | `npm run test:e2e`                             |
| Native lifecycle               | `npm run test:native`                          |
| Linux containers               | `npm run test:container`                       |
| Dependency vulnerabilities     | `npm audit --audit-level=high`                 |

Install browser dependencies separately with `npx playwright install`. Linux CI uses `npx playwright install --with-deps`. Ordinary content editing does not require installing every browser testing dependency on Windows 10.

`.github/workflows/ci.yml` runs quality, native lifecycle, and packaging checks on Windows, Linux, and macOS, with three browsers, root and project paths, and container deployment on Linux. `dependency-audit.yml` adds scheduled dependency checks. Review failure reports, screenshots, and logs instead of repeatedly changing the lockfile.

Pages requires `PAGES_ENABLED=true` or a manual main-branch run with publishing selected. The publishing job rebuilds and validates using the actual address and path returned by Pages. Pull requests receive no publishing permissions.

Record automation and real-device testing separately. A hosted runner does not prove Windows 10 / 11 clients, every Linux distribution, GPUs, or every Mac have passed. Service registration and reboot behavior need a target machine or dedicated VM. Website tests do not prove the desktop products’ runtime behavior.

## Content checks before publishing

- Product capabilities, download states, and requirements agree across both languages, with sources for changed facts.
- Both products are reachable from the home page, and language switching preserves the current product.
- Production origin, deployment prefix, internal links, and assets agree.
- Empty QCopilots downloads have no fake links, and the Search release link is reachable.
- Mobile navigation, keyboard focus, FAQs, reduced motion, and image descriptions work.
- Temporary native instances and containers are stopped. Production instances remain running only after an intentional deployment.

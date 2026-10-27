# Content and engineering maintenance

[简体中文](maintenance.zh.md) · [Back to README](../README.en.md)

This guide is for the people who keep the website up to date. No front-end experience is needed. Here `site` means `.\scripts\site.cmd` on Windows and `bash scripts/site.sh` on Linux / macOS.

## Content model

All text and product data live in `src/content/`. Page components only handle layout. Routine maintenance rarely touches anything else.

| File                           | Purpose                                                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `src/content/types.ts`         | Field definitions for all content. Think of it as the schema                                                 |
| `src/content/products.ts`      | Product registry. Imports each product file and sorts them by `order`, smallest first                        |
| `src/content/products/<id>.ts` | Everything about one product: copy in both languages, theme colours, status, icon, demo, links and downloads |
| `src/content/ui.ts`            | Shared copy: navigation, home page, product page labels, footer                                              |
| `src/content/icons.ts`         | Icon names that content may use. Each maps to an icon in `src/components/Icon.astro`                         |
| `src/content/demos.ts`         | Demo keys. Each maps to a component in `src/components/demos/registry.ts`                                    |
| `docs/product-evidence.md`     | Product facts behind the website copy                                                                        |

Main fields of a product file:

| Field                       | Meaning                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                        | The URL slug, as in `/en/products/qcopilots-search/`. Lowercase letters, digits and hyphens only. Never change it after launch, or shared links break |
| `order`                     | Display order, smallest first. Must be unique                                                                                                         |
| `status`                    | `available` for released products, `coming-soon` for upcoming ones                                                                                    |
| `icon`                      | Icon path (starting with `/images/`) and the image's natural width and height                                                                         |
| `theme`                     | Product colours. See [Theme colours and contrast](#theme-colours-and-contrast)                                                                        |
| `demo`                      | Optional demo key. Without it the generic demo is used                                                                                                |
| `links`                     | Optional HTTPS links: `releases`, `source`, `license`                                                                                                 |
| `locales.zh` / `locales.en` | All copy in each language                                                                                                                             |
| `downloads`                 | Download entries, at least one                                                                                                                        |

`locales` holds the name, category, tagline, summary, SEO text, home card, highlights, examples, optional `facts`, steps, privacy notes, requirements, FAQ, download text and the demo text. The comments in `types.ts` explain each field.

## Editing copy safely

If you are not sure where a piece of text lives, search for it in `src/content/`. Then follow these rules:

1. **Edit both languages together.** The `zh` and `en` sides must have the same fields and list lengths. `site check` compares them entry by entry.
2. **Leave nothing empty.** Empty strings and empty lists fail the check.
3. **No Chinese in English copy.** The English side must not contain Chinese characters or full-width punctuation such as `，。：；（）、！？「」『』`.
4. **Write Chinese the Chinese way.** Use full-width punctuation. Put a half-width space between Chinese and Latin words or numbers, as in “不到 1 GB 的模型”.
5. **Write English the English way.** Keep the meaning, not the word order.
6. **Keep placeholders.** In `ui.ts`, `'Explore {name}'` has `{name}` replaced by the product name. Keep it in both languages.
7. **No unused keys in `ui.ts`.** When a page stops using a string, delete it from `ui.ts`. Otherwise `site check` reports `is not used`.
8. **Only use icon names from `icons.ts`.** For a new icon, see [Adding an icon](#adding-an-icon).
9. **Back product facts with evidence.** When a version, format or requirement changes, update the [product evidence record](product-evidence.md) too.
10. **Check narrow screens.** Preview with `site dev`, shrink the browser window to phone width and check line breaks in both languages.

The home headline is `home.title` in `ui.ts`, in two parts. After changing it or `home.eyebrow`, [regenerate the share images](#social-preview-images).

## Enabling or updating downloads

Each entry in `downloads` looks like this:

```ts
{
  id: 'qcopilots-windows',
  platform: 'windows',          // windows | macos | linux | all
  label: { zh: 'Windows', en: 'Windows' },
  url: null,                    // null until the download exists
  requirements: { zh: '…', en: '…' },  // optional
  architecture: 'x64',          // optional
  version: '1.0.0',             // optional
}
```

When the QCopilots packages are ready:

1. Change the product's `status` from `'coming-soon'` to `'available'`.
2. Replace each platform's `url: null` with a verified HTTPS address.
3. Fill in `requirements`, `architecture` and `version` only when the release notes support them.
4. Update `downloads.description` in both languages and the [product evidence record](product-evidence.md).
5. Run `site check`.

A `coming-soon` product cannot have download URLs. The check blocks it. A `null` URL shows a disabled “Download coming soon” state, never an empty link or `#`.

Do not substitute the upstream QGIS download page for QCopilots packages, and do not infer QCopilots compatibility from QGIS platforms. QCopilots Search links to its latest GitHub release page, `releases/latest`, so the site never breaks when file names change.

## Adding a product

Using `QCopilots-xxx` as the example:

1. **Copy a product file.** Copy `src/content/products/qcopilots-search.ts` to `src/content/products/qcopilots-xxx.ts`.
2. **Set the basics.**
   - `id: 'qcopilots-xxx'`. This is also part of the URL.
   - `order`: a number nobody else uses, such as `30`. It sets the position in navigation and on the home page.
   - `status`: `'available'` or `'coming-soon'`.
3. **Add the icon.** Put the file in `public/images/`, for example `public/images/xxx-icon.svg`. Set `icon: { src: '/images/xxx-icon.svg', width: …, height: … }` with the image's natural size. Record its origin and license in [Assets](assets.md).
4. **Choose theme colours.** Fill in the three `theme` colours. See [Theme colours and contrast](#theme-colours-and-contrast).
5. **Write both languages.** Rewrite everything in `locales.zh` and `locales.en`. Highlight `icon` values must come from `icons.ts`.
6. **Demo.** Without a dedicated demo, delete the `demo` line. The page then uses `GenericDemo` automatically, with text from `locales.*.demo`. For a dedicated demo, see [Product demos](#product-demos).
7. **Downloads and links.** Fill in `downloads`, at least one entry. With `coming-soon`, every `url` is `null`. `links` is optional and must use HTTPS.
8. **Register the product** in `src/content/products.ts`:

   ```ts
   import qcopilotsXxx from './products/qcopilots-xxx.ts';

   export const products: readonly Product[] = [qcopilots, qcopilotsSearch, qcopilotsXxx].toSorted(
     (a, b) => a.order - b.order,
   );
   ```

9. **Update the family copy.** The home headline, `meta.description` in `src/content/ui.ts` and the OG images describe the whole family ("maps and files"). If the new product changes that story, update both languages and run `site run render:og`.
10. **Run the checks** in the order given in [Checks before publishing](#checks-before-publishing).

The new product then appears automatically in:

- Its pages in both languages, `/zh/products/qcopilots-xxx/` and `/en/products/qcopilots-xxx/`
- The header, footer, home page product cards and examples
- The “More from QCopilots” section at the bottom of product pages
- The sitemap, `sitemap.xml`
- The content checks, build checks and browser tests

### Adding an icon

1. Add the name to `iconNames` in `src/content/icons.ts`.
2. In `src/components/Icon.astro`, import the matching Light SVG from `@phosphor-icons/core/assets/light/` and add it to the `icons` map.
3. Run `site check`.

## Product demos

The “windows” on product pages and home cards are illustrations drawn with HTML, CSS and SVG, not screenshots. They carry an “Illustrative preview / 界面示意” label, and their text follows the page language.

To add a dedicated demo:

1. Add a key to `demoKeys` in `src/content/demos.ts`, for example `'xxx-window'`.
2. Create a component in `src/components/demos/`, for example `XxxDemo.astro`. Copying `GenericDemo.astro` is a good start.
3. Map the key to the component in `src/components/demos/registry.ts`.
4. Set `demo: 'xxx-window'` in the product file.

The demo contract (also written in a comment in `DemoFrame.astro`):

- **Props are always `{ copy, variant }`.** `copy` is the product's `locales.*.demo`. `variant` is `'full'` (product page) or `'thumb'` (home card).
- **Render one `.demo-window`, sized entirely in `em`.** Set `--demo-width` in em (default 60). The frame scales the font size so the window always fits, at any screen width.
- **Scenes use `data-scene`.** The first scene is `data-scene="0"`. Every other scene gets `hidden`. Without JavaScript, only the first scene shows.
- **Animate with two classes only.** `.d-in` fades in following `--d` (0, 1, 2…). `.d-type` reveals text from left to right like typing. When motion is off, both rest in their final state.
- **No interactive elements.** No buttons, links or inputs. Draw them with `span` or `div`. The demo area is `inert` and `aria-hidden`, so screen readers read the caption instead.
- **All text comes from content.** Hard-code no words in the component. Put button names and similar text in `copy.labels`, with the same keys in both languages.
- **Colours come from variables.** Use the variables in `tokens.css` plus `--product-accent` and `--product-wash`. No colour values.
- **No product names in class names.** The build check rejects selectors like `.search-…` or ones named after a product `id`. Use a short neutral prefix.

Playback lives in `demo-motion.ts`. While a demo is on screen it moves to the next scene every 9 seconds. Visitors can pause it with the button next to the caption. With “reduce motion” turned on in the operating system, nothing plays and the pause button is hidden.

## Theme colours and contrast

Each product has three `theme` colours, all written as `#rrggbb`:

| Field       | Used for                                  | Requirement                                                                               |
| ----------- | ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `accent`    | Decoration: rules, icons, demo highlights | No text contrast requirement                                                              |
| `accentInk` | Text: links, small headings               | At least 4.5:1 contrast on `#faf9f5` (the ivory background), `#ffffff` and its own `wash` |
| `wash`      | Pale backgrounds: bands, demo stages      | Light enough for `accentInk` to pass                                                      |

`site check` measures the contrast and names the background that fails. Usually a slightly darker `accentInk` fixes it.

These colours reach the product page, home cards and demos as `--product-accent`, `--product-accent-ink` and `--product-wash`. Site-wide colours are defined only in `src/styles/tokens.css`. All other styles reference variables. The full design rules are in the [design reference](../design-qa.md).

## Fonts

| Font                   | Used for                    |
| ---------------------- | --------------------------- |
| Newsreader Variable    | English headings            |
| Noto Serif SC Variable | Chinese headings            |
| Noto Sans SC Variable  | Body text in both languages |

The fonts come from the `@fontsource-variable/*` npm packages. They are imported in `src/layouts/SiteLayout.astro`, and the font stacks are `--font-display` and `--font-body` in `tokens.css`. The build copies the font files into `dist/`, so they are served from the site's own domain. Nothing goes through Google Fonts or another CDN, which matters for visitors in mainland China. The Chinese fonts are split into many small files by character range, and browsers download only the parts a page uses.

When upgrading a font package, refresh the license copies in `public/licenses/` and `docs/licenses/` from the package's `LICENSE`, then check headings on Chinese and English pages.

## Social preview images

`public/images/og-zh.png` and `public/images/og-en.png` are the previews that social sites and chat apps show for shared links. They are 1200 × 630. `scripts/render-og.mjs` renders them with Playwright from `home.title` and `home.eyebrow` in `ui.ts`, the line art in `LineArt.astro` and the QCopilots icon.

Regenerate them when you:

- change the home headline `home.title` or `home.eyebrow`
- change `src/components/LineArt.astro` or `public/images/qcopilots-icon.svg`
- change the main colours or heading fonts

```bash
site browsers chromium    # first time only
site run render:og
```

Commit both PNG files. `site run test:built` checks that they exist and have the right size.

## Checks before publishing

Before pushing to `main`, run in this order:

1. `site check`: types and content
2. `site run format:check`: formatting. If it fails, run `site run format`
3. `site run lint`: code checks
4. `site run test`: unit tests
5. `site build`: build `dist/`
6. `site run test:built`: check the build output
7. `site browsers chromium`: first time only
8. `site run test:e2e`: browser and accessibility tests
9. If the home headline changed, run `site run render:og` and commit the new images
10. Walk through the list in the [design reference](../design-qa.md#visual-qa-checklist) with `site dev`

What each check catches:

| Command               | What it checks                                                                                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site check`          | Astro types. `scripts/check-content.mjs`: zh/en structure match, no Chinese in English copy, theme contrast, valid demo keys and icon names, no download URLs on `coming-soon` products, HTTPS links, no unused `ui.ts` keys      |
| `site run test`       | Unit tests for the URL and path helpers                                                                                                                                                                                           |
| `site run test:built` | `scripts/verify-build.mjs`: every link and file exists, bilingual SEO and sitemap, no Chinese on English pages outside `lang="zh-CN"` elements, download states, demo structure, share image size, no product-named CSS selectors |
| `site run test:e2e`   | Playwright browser tests (`tests/e2e`): navigation, language switching, FAQ, keyboard focus, mobile layout, reduced motion, use without JavaScript, and axe accessibility checks                                                  |
| `site run test:live`  | Visits every page of the live site. See [Development and deployment](deployment.en.md#checking-the-live-build)                                                                                                                    |

Browser tests use only Chromium by default. To include Firefox and WebKit, run `site browsers all`, then set the environment variable `E2E_BROWSERS=all`. To test the GitHub Pages project path, set `BASE_PATH=/QCopilots-Website/` before building and testing. On Linux, add `--with-deps` the first time, as in `site browsers all --with-deps`, to install the system packages browsers need.

Environment variables last for the current terminal window only. To set one:

```text
PowerShell   $env:E2E_BROWSERS = 'all'
cmd          set E2E_BROWSERS=all
Bash         export E2E_BROWSERS=all
```

After a push, CI repeats these checks on three operating systems, three browsers and two deployment paths, and also runs native deployment, a Linux container and a dependency security audit. When something fails, read the reports, screenshots and logs in Actions first. Do not keep changing the lockfile in the hope it passes.

Automated tests are not real-device acceptance. Green CI does not prove every Windows 10 / 11 PC, Linux distribution or Mac works. Startup services and reboot behaviour need checking on the target machine.

## Keeping Node and npm in sync

The repository pins Node 24.22.1 and npm 11.19.1. To upgrade, change all of these together:

| Location                                                             | What to change                                                                                                      |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `.node-version`                                                      | The Node version                                                                                                    |
| `package.json`                                                       | `engines.node`, `engines.npm` and `packageManager`                                                                  |
| `config/toolchain.json`                                              | `nodeVersion`, `npmVersion`, every platform's `node-*-url` and `node-*-sha256`, `nodeChecksumsSource`, `verifiedAt` |
| `.github/workflows/ci.yml`, `.github/workflows/dependency-audit.yml` | Every `node-version:`                                                                                               |

Keep in mind:

- Copy checksums from Node's official `SHASUMS256.txt`. Update x64 and arm64 for Windows, Linux and macOS.
- `npmVersion` must equal the npm bundled with the new Node, or the one-click scripts refuse to run.
- Caddy is pinned in two places too: the `caddy*` fields in `config/toolchain.json` (native deployment) and the image in `Dockerfile` (containers). Keep them on the same version.
- Afterwards, run `site setup` again on each computer to download the new Node into `.tools/`. After pushing, confirm CI passes on all three platforms.

## Dependency updates

- Dependencies use exact versions, and `package-lock.json` is committed. Routine installs use `npm ci` (which is what `site setup` does). Regenerate the lockfile only when upgrading.
- Never fix a build by editing `node_modules/`.
- Dependabot (`.github/dependabot.yml`) checks weekly:
  - npm: development tools are grouped into one pull request.
  - GitHub Actions: every action update is grouped into one pull request, because the Pages actions must move together.
  - Docker: updates the Caddy image in `Dockerfile`.
  - Major updates of TypeScript and `@types/node` are ignored. `astro check` and `typescript-eslint` do not support TypeScript 7 yet, and `@types/node` must match the pinned Node 24.
- Merge Dependabot pull requests only after CI passes. When font or icon packages change, check their license texts and the pages as well.
- `.github/workflows/dependency-audit.yml` runs `npm audit` weekly. You can also start it by hand in Actions.

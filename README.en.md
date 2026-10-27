# QCopilots Website

[简体中文](README.md) · [Maintenance](docs/maintenance.en.md) · [Development and deployment](docs/deployment.en.md) · [Design reference](design-qa.md) · [Assets](docs/assets.md)

The bilingual (Chinese and English) website for the QCopilots product family. It currently presents two products:

- **QCopilots**: an AI assistant built into QGIS that does map work from plain language. Coming soon.
- **QCopilots Search**: a desktop app that searches your own documents, photos, recordings and videos by meaning. Available now.

Live site: <https://xiaobing318.github.io/QCopilots-Website/>

The site is built with Astro and produces plain static files. They can be served by GitHub Pages, Caddy or any static file server. Fonts and icons ship with the site, with no external CDN, so pages load normally from mainland China too.

## Quick start

You need Git and an internet connection. You do not need to install Node first. On the first run, the scripts download the pinned Node 24.22.1 into the repository's `.tools/` folder. They never change an existing Node installation or your PATH.

**Windows 10 / 11**: double-click `scripts/site.cmd` in File Explorer to set everything up and open the preview. Or run these from the repository folder in cmd or PowerShell:

```powershell
.\scripts\site.cmd setup
.\scripts\site.cmd dev
```

**Linux / macOS**:

```bash
bash scripts/site.sh setup
bash scripts/site.sh dev
```

`setup` prepares Node and installs dependencies. Run it once per computer. `dev` starts a local preview at <http://127.0.0.1:4321/>. Pages reload as you edit. Press `Ctrl+C` to stop.

> On Windows, do not run `bash scripts/site.sh` from Git Bash. It supports Linux and macOS only. Use cmd or PowerShell instead. See [Development and deployment](docs/deployment.en.md#terminals-on-windows) for why and for workarounds.

## Common commands

In the table, `site` means `.\scripts\site.cmd` on Windows and `bash scripts/site.sh` on Linux / macOS.

| Command                             | What it does                                         |
| ----------------------------------- | ---------------------------------------------------- |
| `site setup`                        | Prepare Node and install dependencies                |
| `site doctor`                       | Show the Node version, ports and deployment status   |
| `site dev`                          | Local preview that reloads as you edit               |
| `site check`                        | Type and content checks (language parity, contrast…) |
| `site build`                        | Build the static site into `dist/`                   |
| `site run test:built`               | Check pages, links and files in `dist/`              |
| `site browsers chromium`            | Install Chromium for browser tests (once)            |
| `site run test:e2e`                 | Browser and accessibility tests, after `build`       |
| `site run lint` / `site run format` | Lint the code / fix formatting                       |
| `site run render:og`                | Regenerate the social preview images                 |
| `site package`                      | Pack `dist/` into a portable archive                 |
| `site deploy native`                | Deploy on this machine with Caddy                    |
| `site deploy compose`               | Deploy on Linux with Docker Compose                  |

Run `site help` to list every command.

## Project layout

```text
src/content/           Copy and product data. Most edits happen here
  products/<id>.ts     One file per product, with both languages
  products.ts          Product registry
  ui.ts                Navigation, home page and other shared copy
src/components/        Page components. demos/ holds the product UI illustrations
src/styles/            tokens.css (colours, type sizes, spacing) and base.css
public/images/         Product icons and social preview images
public/licenses/       Font and icon license texts
scripts/               One-click scripts, checks, packaging and deployment
docs/                  Maintenance, deployment and asset documents
```

Chinese pages start with `/zh/` and English pages with `/en/`. The root address sends visitors to their preferred language, Chinese by default.

## Editing copy

- Product copy lives in `src/content/products/<id>.ts`. Shared copy lives in `src/content/ui.ts`.
- The Chinese `zh` and English `en` sides must match: the same fields and the same number of entries.
- English copy must not contain Chinese characters or full-width punctuation.
- Run `site check` afterwards. If you changed the home headline, also run `site run render:og` to refresh the share images.

See [Maintenance](docs/maintenance.en.md) for the full rules.

## Adding a product

1. Copy `src/content/products/qcopilots-search.ts` to `src/content/products/<new-id>.ts` and write both languages.
2. Import it in `src/content/products.ts` and add it to the `products` list.
3. Put the product icon in `public/images/`.
4. Run the checks.

Routes, navigation, home cards, the sitemap and the tests include the new product automatically. See [Maintenance](docs/maintenance.en.md#adding-a-product) for every step.

## Publishing

Push to `main`. GitHub Actions runs every check on Windows, Linux and macOS, publishes to GitHub Pages when they pass, then visits each live page the way a visitor would.

To pause automatic publishing, set the repository variable `PAGES_ENABLED` to `false`. To host the site on your own server, see [Development and deployment](docs/deployment.en.md).

## Documents

| Document                                            | Contents                                                  |
| --------------------------------------------------- | --------------------------------------------------------- |
| [Maintenance](docs/maintenance.en.md)               | Content model, adding products, demos, pre-publish checks |
| [Development and deployment](docs/deployment.en.md) | GitHub Pages, native Caddy, containers, startup services  |
| [Design reference](design-qa.md)                    | Colours, type, spacing, components and a visual QA list   |
| [Assets](docs/assets.md)                            | Origin and licenses of icons, fonts and share images      |
| [Product evidence](docs/product-evidence.md)        | Product sources behind the website copy                   |
| [Verification](docs/verification.md)                | Scope and results of past verification runs               |

## Licensing

The origin and licenses of product icons, fonts and interface icons are recorded in [Assets](docs/assets.md). The site's [licenses page](https://xiaobing318.github.io/QCopilots-Website/en/licenses/) lists every license text too. This repository does not assign one new license to the products or third-party materials. Each keeps the terms of its original source.

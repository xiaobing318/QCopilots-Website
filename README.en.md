# QCopilots Website

[简体中文](README.md) · [Deployment](docs/deployment.en.md) · [Content maintenance](docs/maintenance.en.md) · [Product evidence](docs/product-evidence.md) · [Verification](docs/verification.md)

A bilingual product website for QCopilots and QCopilots-Search. Built with Astro, TypeScript, and plain CSS, it produces standalone static files. The selected visual direction uses generous white space, green accents, and product illustrations.

## Start on another computer

Clone this repository only. QGIS, QCopilots-Search, llama.cpp, and Codex are not required. Initial setup needs internet access, Git, and Windows PowerShell 5.1 or Bash. The scripts prepare a pinned Node runtime inside the repository without changing global Node installations or the system PATH.

On Windows 10 / 11, run from the repository directory:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 setup
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 dev
```

On Linux / macOS:

```bash
bash scripts/site.sh setup
bash scripts/site.sh dev
```

The development server listens locally by default. Open the URL printed by the command and stop it with `Ctrl+C`. The PowerShell execution policy option applies only to that process, without changing the machine policy.

## Common commands

The examples below use Bash. On Windows, replace `bash scripts/site.sh` with `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1`. The remaining arguments are the same.

```bash
bash scripts/site.sh doctor
bash scripts/site.sh check
bash scripts/site.sh build
bash scripts/site.sh package --source dist --out artifacts
bash scripts/site.sh deploy native
bash scripts/site.sh status
bash scripts/site.sh stop
```

`deploy native` deploys the existing `dist/` output, so run `build` first. The default site address is `http://127.0.0.1:8080`. See the [deployment guide](docs/deployment.en.md) for public domains, startup services, Linux containers, and GitHub Pages. After initial configuration, native and container updates each use a single deployment command.

## Content and structure

| Location                                        | Purpose                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `src/content/products.ts`                       | Product registry, bilingual descriptions, FAQs, use cases, and downloads |
| `src/content/ui.ts`                             | Navigation, home page, and shared interface copy                         |
| `src/components/`, `src/layouts/`, `src/pages/` | Reusable interface, layouts, and real localized routes                   |
| `public/images/`                                | Brand assets and illustrations shipped with this repository              |
| `scripts/`, `config/`                           | Setup, validation, packaging, and deployment entry points                |
| `.github/workflows/`                            | Cross-platform checks, browser tests, and optional Pages publishing      |

Chinese routes start with `/zh/`, and English routes start with `/en/`. Language switching preserves the current product and matching section. The root entry defaults to Chinese and remembers the visitor’s explicit language choice.

QCopilots download URLs for Windows, macOS, and Linux are currently `null`, showing “Download link coming soon.” This describes the website links, not the product’s release status. Add a valid release URL to enable each entry. QCopilots-Search links to its real latest GitHub Releases page.

## Validation and publishing

The repository pins Node 24.22.1, npm 11.19.1, and its dependency lockfile. Use `npm ci` for routine installs. Dependency upgrades must update the lockfile and pass CI. Browser test dependencies are installed separately, keeping routine setup small.

GitHub Actions configures Windows, Linux, and macOS builds, root and project-path checks, Chromium / Firefox / WebKit tests, native deployment lifecycle tests, and a Linux container smoke test. Only eligible publishing jobs receive Pages write permissions. See [maintenance and validation](docs/maintenance.en.md#validation-and-publishing).

Hosted CI runners are not proof of testing every Windows 10 / 11 client, Linux distribution, or Mac. Startup services also require validation on the target operating system.

## Assets and licensing

Product icons retain source attribution, and product window illustrations are explicitly labeled. See the [asset record](docs/assets.md). This repository does not assign a single new license to the products or third-party materials. Their original terms remain applicable.

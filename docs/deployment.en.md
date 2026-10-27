# Development and deployment

[简体中文](deployment.zh.md) · [Back to README](../README.en.md)

## Development environment

You need Git and an internet connection. On Windows 10 / 11, the built-in PowerShell 5.1 is enough. Linux / macOS need Bash, `curl`, `tar`, and `sha256sum` or `shasum`. The first setup downloads from the official Node site and the npm registry. The first native deployment also downloads Caddy from GitHub.

**Windows**, from the repository folder in cmd or PowerShell:

```powershell
.\scripts\site.cmd setup
```

`site.cmd` is only a wrapper. It runs the command below, and both do the same thing:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 setup
```

`ExecutionPolicy Bypass` applies to that one PowerShell process only. It does not change the system's execution policy. Double-clicking `site.cmd` in File Explorer is the one-click start. The first time it runs `setup`, then it opens the local preview at http://127.0.0.1:4321/ in your browser. Close the window to stop the preview. After pulling new changes, run `scripts/site.cmd setup` once to refresh packages. If a step fails, the window stays open with the error.

**Linux / macOS**:

```bash
bash scripts/site.sh setup
```

What `setup` does:

1. If this computer already has exactly Node 24.22.1 with npm 11.19.1, it uses them.
2. Otherwise it downloads the pinned Node from nodejs.org, verifies it against the SHA-256 in `config/toolchain.json` and unpacks it into the repository's `.tools/`.
3. It runs `npm ci` to install dependencies from `package-lock.json`.

The scripts never change a global Node installation, the system PATH or other software. On a new computer or operating system, run `setup` again instead of copying `node_modules/`. Keep `.tools/`, deployment runtime folders, certificates, logs and local configuration out of Git.

If you need a proxy, set `HTTPS_PROXY` / `HTTP_PROXY` and any needed `NO_PROXY` in the terminal that runs the command, and configure an npm registry your network allows. Never store credentials in the repository. If downloads fail, run `doctor` first and confirm the terminal can reach the internet through your proxy.

Below, `site` means `.\scripts\site.cmd` on Windows and `bash scripts/site.sh` on Linux / macOS.

## Terminals on Windows

| Terminal       | How to run                                                                |
| -------------- | ------------------------------------------------------------------------- |
| cmd            | `.\scripts\site.cmd <command>`                                            |
| PowerShell     | `.\scripts\site.cmd <command>`, or the `powershell … site.ps1` form above |
| Git Bash, MSYS | Not recommended. See below                                                |

In Git Bash, `bash scripts/site.sh` stops with an error, because it supports Linux and macOS only. Git Bash can run `./scripts/site.cmd <command>`, but it rewrites environment variables that look like paths into Windows paths. For example `BASE_PATH=/QCopilots-Website/` becomes `C:/Program Files/Git/QCopilots-Website/`, which breaks the build or produces wrong links.

If you must set such a variable in Git Bash, put `MSYS_NO_PATHCONV=1` in front of the same command:

```bash
MSYS_NO_PATHCONV=1 BASE_PATH=/QCopilots-Website/ ./scripts/site.cmd build
```

Using cmd or PowerShell instead is simpler.

## Build-time address and path

`SITE_URL` is the production address with only the scheme and domain, such as `https://www.example.com`. `BASE_PATH` is the path the site lives under, such as `/` or `/QCopilots-Website/`. They shape page links, static files and SEO addresses, so set them at build time. Without them, `SITE_URL` defaults to `https://xiaobing318.github.io` and `BASE_PATH` to `/`.

PowerShell:

```powershell
$env:SITE_URL = 'https://www.example.com'
$env:BASE_PATH = '/'
.\scripts\site.cmd build
```

cmd:

```bat
set SITE_URL=https://www.example.com
set BASE_PATH=/
.\scripts\site.cmd build
```

Bash:

```bash
SITE_URL=https://www.example.com BASE_PATH=/ bash scripts/site.sh build
```

The deployment `basePath` must match the build's `BASE_PATH`. Deployment does not rewrite the domain or path inside static files. Do not wrap the build in a second, different path prefix.

## GitHub Pages

Live site: <https://xiaobing318.github.io/QCopilots-Website/>

### First-time setup

1. In the repository's Settings → Pages, set Source to GitHub Actions.
2. Push to `main` once and confirm the workflow passes in Actions.
3. Open the live address and check that it loads.

Your repository and account must be allowed to use Pages.

### How automatic publishing works

On every push to `main`, `.github/workflows/ci.yml` runs these stages:

1. **Checks**: on Windows, Linux and macOS it sets up through the one-click scripts, then runs formatting, lint, content, unit, build, native deployment and packaging checks. Linux also runs Chromium, Firefox and WebKit browser tests (once at `/` and once at `/QCopilots-Website/`), a Linux container smoke test and a dependency security audit.
2. **Build the Pages artifact** (`pages-build`): reads the real address and path from the Pages settings, builds again and runs the build checks and browser tests on that exact build.
3. **Publish** (`pages-deploy`): publishes the same tested files to Pages.
4. **Live smoke test** (`pages-smoke`): waits until the live `build-info.json` shows this commit (up to 10 minutes), then visits every page in the sitemap as a desktop visitor and as a phone visitor. It checks that each page opens without script errors, failed requests, requests to third-party sites or sideways scrolling. It also tries language switching, the phone menu and the 404 page. Reports are saved in Actions as `live-site-reports`.

Pull requests run the checks but never publish.

### Pausing or publishing by hand

- **Pause automatic publishing**: in Settings → Secrets and variables → Actions → Variables, create a variable `PAGES_ENABLED` with the value `false`. Delete it or change the value to resume.
- **Publish by hand**: in Actions, choose “Website CI and Pages”, click Run workflow, pick the `main` branch and tick publish. It publishes only after every check passes.

### Checking the live build

Every build includes `build-info.json`, which records the commit it was built from:

```text
https://xiaobing318.github.io/QCopilots-Website/build-info.json
```

It looks like `{"buildId":"7004d65…","basePath":"/QCopilots-Website/"}`. Compare `buildId` with the full ID of the latest commit on GitHub, or run `git rev-parse HEAD` locally. For a few minutes after a deployment Pages may still serve the old build. Wait and refresh.

You can also run the same live visit test as CI from your computer:

```bash
site browsers chromium    # first time only
site run test:live
```

It visits the GitHub Pages site by default. Two environment variables change that:

| Variable            | Effect                                                                             |
| ------------------- | ---------------------------------------------------------------------------------- |
| `LIVE_URL`          | The address to visit, for example the site on your own server                      |
| `EXPECTED_BUILD_ID` | Wait until the live `buildId` equals this value before visiting (up to 10 minutes) |

### Custom domain

For a custom domain, change the Pages settings and DNS together. The workflow reads the new address and path from the Pages settings, so `SITE_URL` needs no change. A `CNAME` file alone does not set up the domain.

## Deploying on another machine

Besides GitHub Pages, you can host the site on your own server in three ways:

| Option          | Suits                                                | Command                |
| --------------- | ---------------------------------------------------- | ---------------------- |
| Native Caddy    | Windows, Linux or macOS, no Docker needed            | `site deploy native`   |
| Linux container | Linux with Docker Engine and Compose V2              | `site deploy compose`  |
| Startup service | On top of a native deployment, start with the system | `site service install` |

First clone the repository on the target machine and run `site setup`, then follow the steps below.

### Native deployment

Copy `config/deploy.example.json` to `config/deploy.json` (ignored by Git) and adjust it for the target machine. The defaults work for local verification.

```json
{
  "host": "127.0.0.1",
  "port": 8080,
  "adminPort": 20199,
  "runtimeDir": ".qcopilots-deploy/native",
  "sourceDir": "dist",
  "basePath": "/",
  "domain": null,
  "email": null,
  "serviceName": "qcopilots-website"
}
```

`runtimeDir` can point to a stable external folder. `adminPort` is this site's own local management port and must never be exposed publicly. Each site instance on a machine needs its own runtime folder, site port and admin port.

```bash
site build
site deploy native --config config/deploy.json
site status --config config/deploy.json
site stop --config config/deploy.json
site start --config config/deploy.json
site rollback --config config/deploy.json
```

Deployment reads the existing `sourceDir`, creates a separate release folder, validates the configuration and runs an HTTP health check. Success records the current and previous successful releases. Failure restores the existing deployment. `rollback` needs at least one previous successful release, so keep the runtime folder. The default site address is `http://127.0.0.1:8080`.

`--source`, `--runtime-dir`, `--host`, `--port`, `--admin-port` and `--base-path` override the matching settings. Later `start`, `stop`, `status` and `rollback` commands must use the same configuration or runtime folder.

### Public access

On a private network or behind an existing reverse proxy, set a suitable `host` and a high HTTP port. `host` must be an IP address. `port` and `adminPort` must be within 1024–65535.

To serve public HTTPS directly from Caddy:

1. Set `domain` without a scheme or path, and optionally a contact `email`.
2. Configure DNS, make ports 80 and 443 reachable from outside and make sure the process may bind them.
3. Rebuild with the same HTTPS domain as `SITE_URL`.

A domain adds a 443 listener and automatic HTTP redirects, and keeps the local HTTP listener for health checks. The scripts never change DNS, firewall rules or the system certificate store, and never take over a port that is in use. Set up these external pieces once, then update with `deploy native`.

### Startup services

Complete a normal deployment first, then preview the service installation:

```bash
site service install --config config/deploy.json --dry-run
```

Only an explicit `service install` registers a startup service. Neither `setup` nor a normal deployment does. Run `stop` first so the portable instance does not compete for ports. Installing a service does not start it.

| Platform | Manager         | Prerequisites                                                                                 |
| -------- | --------------- | --------------------------------------------------------------------------------------------- |
| Windows  | Windows Service | Administrator terminal, stable runtime folder and the LocalService account. System scope only |
| Linux    | systemd         | Current-user service by default. System scope needs an existing non-root account              |
| macOS    | launchd         | User service after login by default. System scope needs an existing non-root account          |

Linux and macOS default to `--scope user`. Windows defaults to, and only supports, `--scope system`. For a Linux user service to keep running after logout, the target system needs linger configured in advance. The script does not change it. A macOS user LaunchAgent does not start while nobody is logged in.

Linux / macOS system services need administrator rights and an existing non-root account. Replace `website` below with the real account, preview first, then run the command without `--dry-run` with administrator rights:

```bash
site service install --config config/deploy.json --scope system --user website --dry-run
```

When run through `sudo` without `--user`, the script can use a validated non-root `SUDO_USER`. It never creates accounts or silently runs as root. Before installing, it confirms the target account can read the executable, configuration and release files and write the certificate folder. A Linux system service gains only the extra right to bind low ports. Use this mode or an existing reverse proxy to listen on 80 / 443.

The Windows service runs as `NT AUTHORITY\LocalService`. Installation grants only the read and execute access it needs to Caddy and this site's runtime folder, plus write access to this site's certificate folder. Uninstalling restores the original ACLs if an administrator has not changed them since. A normal `setup` or `deploy` makes no such system permission changes.

`service uninstall` removes this site's service and keeps deployment data. Once installed, start and stop the service with the system commands shown in the install output, not with another portable instance. That output is the authoritative record of the service name, files and start command. Check behaviour after a reboot separately on the target machine.

### Linux container deployment

Install Docker Engine and Compose V2 on the target machine first. The container uses a pinned Caddy image and serves this site's static build. Add a `compose` section to `config/deploy.json`:

```json
{
  "compose": {
    "projectName": "qcopilots-website",
    "runtimeDir": ".qcopilots-deploy/compose",
    "sourceDir": "dist",
    "basePath": "/",
    "host": "127.0.0.1",
    "httpPort": 8080,
    "httpsPort": 8443,
    "domain": null,
    "email": null
  }
}
```

```bash
site build
site deploy compose --config config/deploy.json
site status --target compose --config config/deploy.json
site rollback --target compose --config config/deploy.json
site stop --target compose --config config/deploy.json
```

Each deployment builds a separate local image from the static output. It becomes active only after a successful health check. On failure, the previous image is restored. Certificates live in persistent volumes. `stop` stops this site's containers without deleting those volumes.

For public HTTPS, set `host: "0.0.0.0"`, `httpPort: 80` and `httpsPort: 443`, fill in the domain and email, and configure external DNS. Do not share ports with a native instance.

## Packaging and moving to another machine

```bash
site package --source dist --out artifacts
```

The archive holds the static files, release information and a SHA-256 checksum file. To move to a new machine, either:

- clone the repository there, run `setup` and build again, or
- verify and unpack an existing archive, then deploy it with `--source` pointing at the unpacked folder.

There is no need to copy QGIS, models, a global Node or any product software from the old machine.

Keep runtime data separate from source code. Before moving certificates or deployment state between machines, stop the instances and recheck paths in the configuration. Process IDs and absolute paths do not survive a move, so deploy the static files again on the new machine rather than copying another machine's runtime state.

## Troubleshooting

| Symptom                                | Check                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Setup download fails                   | Network, proxy, official URLs in `config/toolchain.json`, disk space                              |
| “Node 24.22.1 is required”             | Run through `site.cmd`, `site.ps1` or `site.sh`, not a global `node`                              |
| Text loads but images or links break   | Whether the build's `BASE_PATH` matches the deployment `basePath`                                 |
| Git Bash turns paths into `C:/…/Git/…` | Use cmd or PowerShell, or add `MSYS_NO_PATHCONV=1`                                                |
| Port already in use                    | Find the owner with `doctor` and system tools, then change this site's port or stop that instance |
| Health check fails                     | Logs in the runtime folder, static files, path and service permissions                            |
| HTTPS certificate fails                | DNS, reachability of ports 80 / 443, domain spelling, certificate folder permissions              |
| Rollback unavailable                   | Whether a previous successful release exists and the runtime folder is intact                     |
| Live site still old after a push       | Whether Actions passed and `PAGES_ENABLED` is not `false`, then `build-info.json`                 |

After testing, run the matching `stop`. Stop the development server with `Ctrl+C`. These scripts never end other Caddy, Node or product processes by name.

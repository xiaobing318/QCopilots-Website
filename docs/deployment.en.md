# Development and deployment

[简体中文](deployment.zh.md) · [Back to README](../README.en.md)

## Development environment

Use PowerShell 5.1 or later on Windows 10 / 11, and Bash on Linux / macOS. Unix setup requires `curl`, `tar`, and `sha256sum` or `shasum`. Initial setup needs access to the official Node downloads and npm registry. Native deployment also needs the official Caddy release source.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 setup
```

```bash
bash scripts/site.sh setup
```

Setup verifies pinned tool archives, places portable Node in `.tools/`, and runs `npm ci`. An existing matching Node runtime can be reused. Do not move `node_modules/` between computers or platforms. Run setup again. Keep tools, runtime state, certificates, logs, and local configuration out of Git.

If a proxy is required, set `HTTPS_PROXY` / `HTTP_PROXY` and the necessary `NO_PROXY` in the command’s terminal, and configure an npm registry allowed by your network. Do not save credentials in the repository. If downloads fail, use `doctor` and verify that the download tool can use your proxy.

Examples below use `bash scripts/site.sh`. On Windows, replace that with `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1`.

## Build-time address and path

`SITE_URL` is the production origin, such as `https://www.example.com`. `BASE_PATH` is the site path, such as `/` or `/QCopilots-Website/`. Configure both at build time because they affect links, assets, and SEO metadata.

PowerShell:

```powershell
$env:SITE_URL = 'https://www.example.com'
$env:BASE_PATH = '/'
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 build
```

Bash:

```bash
SITE_URL=https://www.example.com BASE_PATH=/ bash scripts/site.sh build
```

Deployment `basePath` must match the build’s `BASE_PATH`. Deployment does not rewrite the origin or path inside static files. Do not add a second, inconsistent path prefix.

## Native deployment

Copy `config/deploy.example.json` to the ignored `config/deploy.json` and adjust it for the target machine. Defaults work for local verification.

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

`runtimeDir` can point to a stable external directory. `adminPort` is a dedicated local management port and must not be exposed publicly. Each instance needs its own runtime directory, site port, and admin port.

```bash
bash scripts/site.sh build
bash scripts/site.sh deploy native --config config/deploy.json
bash scripts/site.sh status --config config/deploy.json
bash scripts/site.sh stop --config config/deploy.json
bash scripts/site.sh start --config config/deploy.json
bash scripts/site.sh rollback --config config/deploy.json
```

Deployment reads the existing `sourceDir`, creates a separate release, validates the configuration, and performs an HTTP health check. Success records the current and previous successful releases. Failure restores the existing deployment. Rollback requires a previous successful release. Preserve the runtime directory to keep that history.

Use `--source`, `--runtime-dir`, `--host`, `--port`, `--admin-port`, and `--base-path` to override configuration values. Subsequent lifecycle commands must use the same configuration or runtime directory.

### Public access

For a private network or an existing reverse proxy, use an appropriate listening `host` and a high HTTP port. `host` must be an IP address, and `port` and `adminPort` must be in 1024–65535. To serve public HTTPS directly through Caddy, set `domain` without a scheme or path, optionally provide a contact `email`, configure DNS, and allow access to ports 80 / 443 with the required binding permissions. This adds a 443 listener and automatic HTTP redirects while preserving the local HTTP listener for health checks. Rebuild with the same HTTPS domain in `SITE_URL`.

Scripts do not change DNS, firewall rules, system certificate trust, or take over occupied ports. Complete these external prerequisites once, then use `deploy native` for updates.

### Startup services

Complete an ordinary deployment first, then preview the service installation:

```bash
bash scripts/site.sh service install --config config/deploy.json --dry-run
```

Only an explicit `service install` registers a startup service. Setup and ordinary deployment do not. Stop the portable instance before installation to avoid competing for ports. Installing a service does not mean it has been started.

| Platform | Manager         | Prerequisites                                                                                  |
| -------- | --------------- | ---------------------------------------------------------------------------------------------- |
| Windows  | Windows Service | Administrator terminal, stable runtime directory, and LocalService identity. System scope only |
| Linux    | systemd         | Defaults to a current-user service. System scope requires an existing non-root account         |
| macOS    | launchd         | Defaults to a user service after login. System scope requires an existing non-root account     |

Linux and macOS default to `--scope user`. Windows defaults to and only supports `--scope system`. A Linux user service needs the appropriate preconfigured linger policy to remain active after logout. The script does not change that policy. A macOS user LaunchAgent does not start before a user logs in.

Linux / macOS system services require administrator permissions and an existing non-root account. Replace `website` below with the actual account, preview the plan, then run without `--dry-run` with administrator permissions:

```bash
bash scripts/site.sh service install --config config/deploy.json --scope system --user website --dry-run
```

When invoked through `sudo` without `--user`, the script can use a validated non-root `SUDO_USER`. It does not create accounts or silently run as root. Installation checks that the target account can read the executable, configuration, and release files and write the certificate directory. Linux system services receive only the extra capability needed to bind low ports. Use this mode or an existing reverse proxy for ports 80 / 443.

Windows uses `NT AUTHORITY\LocalService`. Installation grants the required read and execute access to Caddy and this site’s runtime, with write access limited to the site certificate directory. Uninstall restores the original ACLs if an administrator has not changed them since installation. Ordinary setup and deployment do not apply these system permission changes.

Use `service uninstall` to remove this site’s registration while preserving deployment data. Once installed, use the returned operating system manager commands to start and stop the service, rather than starting another portable instance. The installation output identifies the actual service name, files, and startup command. Validate reboot behavior separately on the target machine.

## Linux container deployment

Install Docker Engine and Compose V2 on the target machine first. The container uses pinned Caddy and this site’s static build. Add a `compose` section to `config/deploy.json`:

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
bash scripts/site.sh build
bash scripts/site.sh deploy compose --config config/deploy.json
bash scripts/site.sh status --target compose --config config/deploy.json
bash scripts/site.sh rollback --target compose --config config/deploy.json
bash scripts/site.sh stop --target compose --config config/deploy.json
```

Each deployment builds an independent local image from the static output. A successful health check activates it, while failure restores the previous image. Certificates use persistent volumes. `stop` stops this site’s containers without deleting those volumes. For public HTTPS, use `host: "0.0.0.0"`, `httpPort: 80`, and `httpsPort: 443`, and provide the domain, email, and external DNS configuration. Do not share ports with a native instance.

## GitHub Pages

1. Select GitHub Actions as the source under repository Settings → Pages.
2. Set the repository variable `PAGES_ENABLED=true` to publish after successful main-branch checks. Publishing can also be selected when manually running the workflow.
3. A project site uses `/QCopilots-Website/`. The Pages job must build with the correct address and project path.
4. For a custom domain, update the build address, path, Pages settings, and DNS together. A `CNAME` file alone does not configure DNS.

Pull request checks do not publish. Your repository and account must support Pages. After enabling it, check the Actions result and verify the actual public URL.

## Packaging and moving to another machine

```bash
bash scripts/site.sh package --source dist --out artifacts
```

The package includes static output, release metadata, and a SHA-256 checksum file. On another machine, either clone and rebuild, or verify and extract a static archive and deploy it with `--source`. No QGIS installation, model files, global Node installation, or Codex settings need to move with the site.

Manage production runtime data separately from source code. Stop instances before moving certificates or deployment state between hosts, then recheck paths and permissions. Prefer deploying static output again on the destination rather than copying process state with stale PIDs and absolute paths.

## Troubleshooting

| Symptom                             | Check                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Setup download fails                | Network, proxy, official URLs in tool locks, and disk space                                                          |
| Text loads but images or links fail | Agreement between build `BASE_PATH` and deployment `basePath`                                                        |
| Port is occupied                    | Use `doctor` and system tools to identify the owner, then change this site’s port or deliberately stop that instance |
| Health check fails                  | Runtime logs, static output, URL path, and permissions                                                               |
| HTTPS issuance fails                | DNS, port 80 / 443 reachability, domain spelling, and certificate storage permissions                                |
| Rollback is unavailable             | A previous successful release and an intact runtime directory                                                        |

After testing, run the matching `stop` command. Use `Ctrl+C` for a development server. The site does not terminate unrelated Caddy, Node, or product processes by name.

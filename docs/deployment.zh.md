# 开发与部署

[English](deployment.en.md) · [返回 README](../README.md)

## 开发环境

Windows 10 / 11 使用 PowerShell 5.1 或更高版本，Linux / macOS 使用 Bash。Unix 初始化需要 `curl`、`tar`，以及 `sha256sum` 或 `shasum`。首次初始化需要访问 Node 官方下载源和 npm registry，原生部署还需要访问 Caddy 官方发布源。

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 setup
```

```bash
bash scripts/site.sh setup
```

脚本校验固定版本工具归档，把便携 Node 保存到仓库内 `.tools/`，再执行 `npm ci`。已有符合版本的 Node 可复用。不要复制其他电脑的 `node_modules/`，换平台或新电脑重新执行 `setup`。不要把 `.tools/`、部署运行目录、证书、日志或本地配置提交到 Git。

需要代理时，在启动命令的终端中设置 `HTTPS_PROXY` / `HTTP_PROXY` 和必要的 `NO_PROXY`，并配置所在网络允许的 npm registry。不要将凭据写进仓库。下载失败时先运行 `doctor` 并确认当前工具能使用该代理。

以下统一以 `bash scripts/site.sh` 表示入口，Windows 替换为 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1`。

## 构建时的域名和路径

`SITE_URL` 是正式站点 origin，例如 `https://www.example.com`。`BASE_PATH` 是站点所在路径，例如 `/` 或 `/QCopilots-Website/`。它们会影响链接、静态资源和 SEO 地址，必须在构建时配置。

PowerShell：

```powershell
$env:SITE_URL = 'https://www.example.com'
$env:BASE_PATH = '/'
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 build
```

Bash：

```bash
SITE_URL=https://www.example.com BASE_PATH=/ bash scripts/site.sh build
```

部署时的 `basePath` 必须与构建的 `BASE_PATH` 一致。静态文件不会在部署时自动改写域名或路径。不要给构建产物添加另一套不一致的路径前缀。

## 原生部署

复制 `config/deploy.example.json` 为忽略的 `config/deploy.json`，按目标机器修改配置。默认值可直接用于本机验证。

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

`runtimeDir` 可设置为固定的外部目录。`adminPort` 是本站独立的本地管理端口，不向公网暴露。正式机器上为每个网站实例选择不同的运行目录、站点端口和管理端口。

```bash
bash scripts/site.sh build
bash scripts/site.sh deploy native --config config/deploy.json
bash scripts/site.sh status --config config/deploy.json
bash scripts/site.sh stop --config config/deploy.json
bash scripts/site.sh start --config config/deploy.json
bash scripts/site.sh rollback --config config/deploy.json
```

部署读取已构建的 `sourceDir`，创建独立版本，校验配置并完成 HTTP 健康检查。成功后记录当前与上一成功版本，失败时恢复已有部署。`rollback` 需要至少一个上一成功版本。保留运行目录，否则无法恢复历史版本。

可用 `--source`、`--runtime-dir`、`--host`、`--port`、`--admin-port` 和 `--base-path` 覆盖相应配置。后续 `start`、`stop`、`status` 与 `rollback` 应使用相同配置或运行目录。

### 对外提供服务

仅内网或现有反向代理后方的服务，可以设置适当的 `host` 和高位 HTTP 端口。`host` 使用 IP 地址，`port` 与 `adminPort` 的范围为 1024–65535。直接由 Caddy 提供公网 HTTPS 时，填写不含协议或路径的 `domain`，按需填写联系邮件 `email`，配置对应 DNS，并确保 80 / 443 端口可达且进程有权绑定。域名配置会增加 443 监听和自动 HTTP 跳转，同时保留原有本地 HTTP 监听用于健康检查。`SITE_URL` 使用同一个 HTTPS 域名重新构建。

脚本不自动修改 DNS、防火墙、系统证书信任库或抢占已有端口。首次需要完成这些外部条件，之后使用 `deploy native` 更新即可。

### 开机自启

先完成普通部署，再预览服务安装内容：

```bash
bash scripts/site.sh service install --config config/deploy.json --dry-run
```

显式执行 `service install` 才注册开机服务，普通初始化和部署不会注册。安装前先停止便携实例，避免它与系统服务争用端口。服务安装不等于已经启动服务。

| 平台    | 管理方式        | 前提                                                               |
| ------- | --------------- | ------------------------------------------------------------------ |
| Windows | Windows Service | 管理员终端，固定运行目录，使用 LocalService 账号，仅支持系统级服务 |
| Linux   | systemd         | 默认当前用户服务，系统服务须显式指定现有非 root 账号               |
| macOS   | launchd         | 默认登录后启动的用户服务，系统服务须显式指定现有非 root 账号       |

Linux 与 macOS 默认 `--scope user`，Windows 默认且仅支持 `--scope system`。Linux 用户服务若要在用户退出后持续运行，需要目标系统预先配置相应的 linger 策略，脚本不自动修改。用户级 macOS LaunchAgent 不等于无人登录时的开机服务。

Linux / macOS 的系统级服务需要管理员权限与一个已存在的非 root 账号。把下列 `website` 替换为实际账号，先预览，再在管理员权限下执行不带 `--dry-run` 的命令：

```bash
bash scripts/site.sh service install --config config/deploy.json --scope system --user website --dry-run
```

通过 `sudo` 执行且未提供 `--user` 时，脚本可使用经验证的非 root `SUDO_USER`。脚本不会自动创建账号，也不会静默使用 root。安装前会以目标账号核验程序、配置和发布文件的可读权限，以及证书目录的可写权限。Linux 系统服务仅额外授予绑定低位端口的能力，直接监听 80 / 443 应使用此方式或现有反向代理。

Windows 服务使用 `NT AUTHORITY\LocalService`，安装时仅为 Caddy 程序和本站运行目录添加所需的读取执行权限，并允许写入本站证书目录。卸载时，在权限未被管理员另行修改的情况下恢复原有 ACL。普通 `setup`、`deploy` 不执行这些系统权限更改。

使用 `service uninstall` 移除本站注册的服务，保留部署数据。服务安装后使用返回的系统管理器命令启动和停止，避免再启动便携实例。安装命令输出是实际服务名称、文件和启动方式的来源。目标机器必须单独验证重启后服务行为。

## Linux 容器部署

目标机器预先安装 Docker Engine 与 Compose V2。容器使用固定版本 Caddy，构建输入仍是本网站的静态产物。在 `config/deploy.json` 中增加 `compose`：

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

每次部署从产物生成独立的本地镜像版本，健康检查通过后激活，失败则恢复上一镜像。证书使用持久化卷。`stop` 停止本站容器，不删除证书卷。正式公网 HTTPS 设置 `host: "0.0.0.0"`、`httpPort: 80`、`httpsPort: 443`，并填写域名、邮件和外部 DNS。不要与原生实例共用同一端口。

## GitHub Pages

1. 在仓库 Settings → Pages 中选择 GitHub Actions 作为来源。
2. 添加仓库变量 `PAGES_ENABLED=true`，允许主分支检查通过后自动发布。也可从工作流手动选择发布。
3. 项目站点使用 `/QCopilots-Website/`，通过 Pages 部署任务配置正确的站点地址与路径。
4. 若改为自定义域名，同步调整构建地址、路径和 Pages 设置，并配置 DNS。仅提交 `CNAME` 不会完成域名配置。

Pull request 检查不发布。Pages 发布需要仓库与账户本身允许使用该服务。第一次启用后在 Actions 中确认结果，再验证实际公开地址。

## 搬迁与归档

```bash
bash scripts/site.sh package --source dist --out artifacts
```

归档包括静态产物、版本信息和 SHA-256 校验文件。搬迁时可在新机器克隆仓库并重新构建，也可校验并解压已有静态包后通过 `--source` 指定它。不需要把旧机器上的 QGIS、模型、Node 全局安装或 Codex 配置一起复制。

正式运行数据与源码分开管理。跨主机搬迁证书与部署状态前先停止相关实例，并按目标目录重新检查配置。为避免 PID 与绝对路径失效，推荐在目标机器重新部署静态产物，而不是直接复用另一台机器的运行状态。

## 故障排查

| 现象                       | 检查方向                                                             |
| -------------------------- | -------------------------------------------------------------------- |
| 初始化下载失败             | 网络、代理、工具锁中的官方 URL、磁盘空间                             |
| 页面有文字但图片或链接失效 | 构建 `BASE_PATH` 与部署 `basePath` 是否一致                          |
| 端口占用                   | 通过 `doctor` 和系统工具确认占用来源，更换本站端口或明确停止相关实例 |
| 健康检查失败               | 查看运行目录日志，确认静态产物、URL 路径与服务权限                   |
| HTTPS 签发失败             | DNS、80 / 443 可达性、域名正确性和证书存储权限                       |
| 无法回滚                   | 是否存在上一成功版本，是否移动或删除过运行目录                       |

测试结束后执行对应 `stop`，开发服务使用 `Ctrl+C`。本站不会按进程名批量终止其他 Caddy、Node 或产品程序。

# 开发与部署

[English](deployment.en.md) · [返回 README](../README.md)

## 开发环境

需要 Git 和网络。Windows 10 / 11 自带的 PowerShell 5.1 即可。Linux / macOS 需要 Bash、`curl`、`tar`，以及 `sha256sum` 或 `shasum`。首次初始化会访问 Node 官方下载站和 npm 仓库，首次原生部署还会从 GitHub 下载 Caddy。

**Windows**，在仓库目录打开 cmd 或 PowerShell：

```powershell
.\scripts\site.cmd setup
```

`site.cmd` 只是一层包装，实际执行的是下面这条命令，两者效果相同：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 setup
```

`ExecutionPolicy Bypass` 只对这一次 PowerShell 进程生效，不修改系统的执行策略。在资源管理器中双击 `site.cmd` 即可一键开始。首次使用时它会先运行 `setup`，然后在浏览器中打开本地预览 http://127.0.0.1:4321/。关闭窗口即停止预览。拉取新的改动后，请运行一次 `scripts/site.cmd setup` 更新依赖。任一步骤失败时，窗口会保留并显示错误。

**Linux / macOS**：

```bash
bash scripts/site.sh setup
```

`setup` 的工作过程：

1. 如果电脑上已有完全相同版本的 Node 24.22.1 和 npm 11.19.1，直接使用。
2. 否则从 Node 官网下载固定版本，用 `config/toolchain.json` 中的 SHA-256 校验，再解压到仓库内的 `.tools/`。
3. 运行 `npm ci`，按 `package-lock.json` 安装依赖。

脚本不修改全局 Node、系统 PATH 或其他软件。换电脑或换系统时重新运行 `setup`，不要复制别处的 `node_modules/`。`.tools/`、部署运行目录、证书、日志和本地配置都不要提交到 Git。

需要代理时，在运行命令的终端中设置 `HTTPS_PROXY` / `HTTP_PROXY` 和必要的 `NO_PROXY`，并配置所在网络允许访问的 npm 仓库地址。不要把凭据写进仓库。下载失败时先运行 `doctor`，确认当前终端能通过代理访问外网。

下文用 `site` 代表入口命令：Windows 上是 `.\scripts\site.cmd`，Linux / macOS 上是 `bash scripts/site.sh`。

## Windows 上的几种终端

| 终端           | 用法                                                          |
| -------------- | ------------------------------------------------------------- |
| cmd            | `.\scripts\site.cmd <命令>`                                   |
| PowerShell     | `.\scripts\site.cmd <命令>`，或上文的 `powershell … site.ps1` |
| Git Bash、MSYS | 不推荐，见下文                                                |

在 Git Bash 中运行 `bash scripts/site.sh` 会直接报错，因为它只支持 Linux 和 macOS。Git Bash 可以运行 `./scripts/site.cmd <命令>`，但它会把看起来像路径的环境变量改写成 Windows 路径。例如 `BASE_PATH=/QCopilots-Website/` 会变成 `C:/Program Files/Git/QCopilots-Website/`，导致构建失败或生成错误的链接。

如果一定要在 Git Bash 中设置这类变量，在同一条命令前加上 `MSYS_NO_PATHCONV=1`：

```bash
MSYS_NO_PATHCONV=1 BASE_PATH=/QCopilots-Website/ ./scripts/site.cmd build
```

更简单的做法是改用 cmd 或 PowerShell。

## 构建时的域名和路径

`SITE_URL` 是正式站点的地址，只写协议和域名，例如 `https://www.example.com`。`BASE_PATH` 是站点所在的路径，例如 `/` 或 `/QCopilots-Website/`。它们决定页面链接、静态资源和 SEO 地址，必须在构建时设置。不设置时，`SITE_URL` 默认为 `https://xiaobing318.github.io`，`BASE_PATH` 默认为 `/`。

PowerShell：

```powershell
$env:SITE_URL = 'https://www.example.com'
$env:BASE_PATH = '/'
.\scripts\site.cmd build
```

cmd：

```bat
set SITE_URL=https://www.example.com
set BASE_PATH=/
.\scripts\site.cmd build
```

Bash：

```bash
SITE_URL=https://www.example.com BASE_PATH=/ bash scripts/site.sh build
```

部署时的 `basePath` 必须与构建时的 `BASE_PATH` 一致。部署不会改写静态文件中的域名或路径，也不要在构建结果外面再套一层不一致的路径前缀。

## GitHub Pages

线上地址：<https://xiaobing318.github.io/QCopilots-Website/>

### 首次启用

1. 在仓库的 Settings → Pages 中，把 Source 设为 GitHub Actions。
2. 推送一次 `main`，在 Actions 中确认工作流全部通过。
3. 打开线上地址，确认能正常访问。

Pages 需要仓库和账户本身允许使用该服务。

### 自动发布流程

每次推送到 `main`，`.github/workflows/ci.yml` 依次执行：

1. **检查**：在 Windows、Linux、macOS 上用一键脚本初始化，再运行格式、代码、内容、单元测试、构建、原生部署和打包检查。Linux 上还运行 Chromium、Firefox、WebKit 三种浏览器测试（根路径 `/` 和项目路径 `/QCopilots-Website/` 各一遍）、Linux 容器冒烟测试和依赖安全审计。
2. **构建发布包**（`pages-build`）：从 Pages 设置读取真实的域名和路径，重新构建，再对这份构建运行构建检查和浏览器测试。
3. **发布**（`pages-deploy`）：把通过测试的同一份文件发布到 Pages。
4. **线上冒烟**（`pages-smoke`）：等待线上 `build-info.json` 显示本次提交的编号（最多 10 分钟），然后分别以桌面和手机身份访问站点地图中的每一页。它会检查页面能否打开、有没有脚本错误、失败的请求、对第三方网站的请求或横向滚动，还会测试语言切换、手机菜单和 404 页面。报告保存在 Actions 的 `live-site-reports` 中。

Pull request 只运行检查，不会发布。

### 暂停或手动发布

- **暂停自动发布**：在仓库 Settings → Secrets and variables → Actions → Variables 中，新建变量 `PAGES_ENABLED`，值为 `false`。删除该变量或改成其他值即可恢复。
- **手动发布**：在 Actions 中选择 “Website CI and Pages”，点击 Run workflow，分支选 `main`，勾选 publish。检查全部通过后才会发布。

### 确认线上版本

每次构建都会生成 `build-info.json`，记录构建对应的提交编号：

```text
https://xiaobing318.github.io/QCopilots-Website/build-info.json
```

内容类似 `{"buildId":"7004d65…","basePath":"/QCopilots-Website/"}`。把 `buildId` 与 GitHub 上最新提交的完整编号比较，或在本机运行 `git rev-parse HEAD`。发布后几分钟内，Pages 可能仍返回旧版本，稍等再刷新即可。

也可以在本机运行与 CI 相同的线上访问测试：

```bash
site browsers chromium    # 第一次需要
site run test:live
```

默认访问 GitHub Pages 线上地址。两个环境变量可以改变它的行为：

| 变量                | 作用                                                        |
| ------------------- | ----------------------------------------------------------- |
| `LIVE_URL`          | 要访问的地址，例如自己服务器上的站点                        |
| `EXPECTED_BUILD_ID` | 等到线上 `buildId` 与这个值一致后再开始访问，最多等 10 分钟 |

### 自定义域名

改用自定义域名时，同时调整 Pages 设置和 DNS。工作流会从 Pages 设置中读取新的域名和路径，不需要修改 `SITE_URL`。只提交 `CNAME` 文件不能完成域名配置。

## 在另一台机器上部署

除了 GitHub Pages，还可以把网站部署到自己的服务器。有三种方式：

| 方式       | 适合                                        | 命令                   |
| ---------- | ------------------------------------------- | ---------------------- |
| 原生 Caddy | Windows、Linux、macOS，不需要 Docker        | `site deploy native`   |
| Linux 容器 | 已安装 Docker Engine 和 Compose V2 的 Linux | `site deploy compose`  |
| 开机服务   | 在原生部署的基础上，让网站随系统启动        | `site service install` |

先在目标机器上克隆仓库并运行 `site setup`，再按下文操作。

### 原生部署

复制 `config/deploy.example.json` 为 `config/deploy.json`（已被 Git 忽略），按目标机器修改。默认值可直接用于本机验证。

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

`runtimeDir` 可以设为固定的外部目录。`adminPort` 是本站独立的本地管理端口，不要暴露到公网。同一台机器上的每个网站实例，需要使用不同的运行目录、站点端口和管理端口。

```bash
site build
site deploy native --config config/deploy.json
site status --config config/deploy.json
site stop --config config/deploy.json
site start --config config/deploy.json
site rollback --config config/deploy.json
```

部署读取已构建好的 `sourceDir`，创建独立的版本目录，校验配置并完成 HTTP 健康检查。成功后记录当前版本与上一个成功版本，失败时恢复原有部署。`rollback` 需要至少一个上一成功版本。请保留运行目录，否则无法回滚。默认站点地址为 `http://127.0.0.1:8080`。

`--source`、`--runtime-dir`、`--host`、`--port`、`--admin-port` 和 `--base-path` 可以覆盖对应配置。之后的 `start`、`stop`、`status`、`rollback` 要使用相同的配置或运行目录。

### 对外提供服务

只在内网或现有反向代理后面使用时，设置合适的 `host` 和高位 HTTP 端口即可。`host` 必须是 IP 地址，`port` 和 `adminPort` 的范围是 1024–65535。

由 Caddy 直接提供公网 HTTPS 时：

1. 填写不含协议和路径的 `domain`，按需填写联系邮箱 `email`。
2. 配置 DNS，确保 80 和 443 端口可以从外网访问，进程有权限绑定这两个端口。
3. 用同一个 HTTPS 域名作为 `SITE_URL` 重新构建。

配置域名后会增加 443 监听和自动 HTTP 跳转，同时保留本地 HTTP 监听用于健康检查。脚本不会修改 DNS、防火墙或系统证书信任库，也不会抢占已被占用的端口。这些外部条件只需首次完成，之后用 `deploy native` 更新即可。

### 开机自启

先完成一次普通部署，再预览服务安装内容：

```bash
site service install --config config/deploy.json --dry-run
```

只有显式运行 `service install` 才会注册开机服务，`setup` 和普通部署都不会。安装前先运行 `stop` 停止便携实例，避免与系统服务争用端口。安装服务不等于已经启动服务。

| 平台    | 管理方式        | 前提                                                                 |
| ------- | --------------- | -------------------------------------------------------------------- |
| Windows | Windows Service | 管理员终端，固定运行目录，使用 LocalService 账号，仅支持系统级服务   |
| Linux   | systemd         | 默认为当前用户服务。系统级服务须指定一个已存在的非 root 账号         |
| macOS   | launchd         | 默认为登录后启动的用户服务。系统级服务须指定一个已存在的非 root 账号 |

Linux 与 macOS 默认 `--scope user`，Windows 默认且只支持 `--scope system`。Linux 用户服务要在用户退出登录后继续运行，需要目标系统预先配置 linger，脚本不会自动修改。macOS 的用户级 LaunchAgent 在无人登录时不会启动。

Linux / macOS 的系统级服务需要管理员权限和一个已存在的非 root 账号。把下面的 `website` 换成实际账号，先预览，再以管理员权限运行不带 `--dry-run` 的命令：

```bash
site service install --config config/deploy.json --scope system --user website --dry-run
```

通过 `sudo` 运行且未提供 `--user` 时，脚本可以使用经过验证的非 root `SUDO_USER`。脚本不会创建账号，也不会悄悄以 root 运行。安装前会以目标账号确认能读取程序、配置和发布文件，能写入证书目录。Linux 系统服务只额外获得绑定低位端口的权限。直接监听 80 / 443 时，请使用这种方式或现有的反向代理。

Windows 服务使用 `NT AUTHORITY\LocalService` 账号。安装时只为 Caddy 程序和本站运行目录添加必要的读取和执行权限，并允许写入本站证书目录。卸载时，如果管理员没有另外改过这些权限，会恢复原来的 ACL。普通的 `setup` 和 `deploy` 不做这些系统权限修改。

`service uninstall` 移除本站注册的服务，保留部署数据。服务安装后，用命令输出中给出的系统命令启动和停止服务，不要再启动便携实例。安装命令的输出就是服务名称、文件位置和启动方式的准确来源。重启后的服务行为需要在目标机器上单独验证。

### Linux 容器部署

目标机器需预先安装 Docker Engine 和 Compose V2。容器使用固定版本的 Caddy 镜像，内容仍是本网站的静态构建结果。在 `config/deploy.json` 中加入 `compose` 部分：

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

每次部署都会从构建结果生成一个独立的本地镜像版本，健康检查通过后才启用，失败则恢复上一个镜像。证书保存在持久化卷中。`stop` 停止本站容器，不删除证书卷。

公网 HTTPS 部署时，设置 `host: "0.0.0.0"`、`httpPort: 80`、`httpsPort: 443`，填写域名、邮箱，并配置外部 DNS。不要与原生实例共用同一端口。

## 搬迁与归档

```bash
site package --source dist --out artifacts
```

归档包含静态文件、版本信息和 SHA-256 校验文件。搬到新机器时有两种做法：

- 在新机器克隆仓库，运行 `setup` 后重新构建。
- 校验并解压已有的归档，部署时用 `--source` 指向解压目录。

不需要复制旧机器上的 QGIS、模型、全局 Node 或其他产品程序。

运行数据和源码分开管理。跨机器搬迁证书和部署状态前，先停止相关实例，并按新目录重新检查配置。进程编号和绝对路径在新机器上会失效，所以推荐在目标机器上重新部署静态文件，而不是复制另一台机器的运行状态。

## 故障排查

| 现象                             | 检查方向                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------- |
| 初始化下载失败                   | 网络、代理、`config/toolchain.json` 中的官方地址、磁盘空间                        |
| 提示需要 Node 24.22.1            | 用 `site.cmd`、`site.ps1` 或 `site.sh` 运行，不要直接用全局 `node`                |
| 页面有文字但图片或链接失效       | 构建时的 `BASE_PATH` 与部署时的 `basePath` 是否一致                               |
| Git Bash 中路径变成 `C:/…/Git/…` | 改用 cmd 或 PowerShell，或加 `MSYS_NO_PATHCONV=1`                                 |
| 端口被占用                       | 用 `doctor` 和系统工具找出占用者，更换本站端口或停止相关实例                      |
| 健康检查失败                     | 查看运行目录中的日志，确认静态文件、路径和服务权限                                |
| HTTPS 证书签发失败               | DNS、80 / 443 端口可达性、域名拼写、证书目录权限                                  |
| 无法回滚                         | 是否存在上一成功版本，运行目录是否被移动或删除                                    |
| 推送后线上仍是旧版本             | 查看 Actions 是否全部通过、`PAGES_ENABLED` 是否为 `false`，再看 `build-info.json` |

测试结束后运行对应的 `stop`，开发服务用 `Ctrl+C` 停止。本站脚本不会按进程名批量结束其他 Caddy、Node 或产品程序。

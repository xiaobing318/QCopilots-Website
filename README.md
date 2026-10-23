# QCopilots Website

[English](README.en.md) · [部署指南](docs/deployment.zh.md) · [内容维护](docs/maintenance.zh.md) · [产品事实来源](docs/product-evidence.md) · [验证记录](docs/verification.md)

QCopilots 系列的中英文产品官网，介绍 QCopilots 与 QCopilots-Search。采用 Astro、TypeScript 和原生 CSS，构建结果为可独立部署的静态文件。当前采用已选定的第一套视觉方向，以清晰留白、绿色点缀和产品展示为主。

## 在另一台电脑上开始

只需克隆本仓库，不需要 QGIS、QCopilots-Search、llama.cpp 或 Codex。首次初始化需要网络、Git，以及 Windows PowerShell 5.1 或 Bash。脚本在仓库内准备固定版本 Node，不修改全局 Node 或系统 PATH。

Windows 10 / 11，在仓库目录执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 setup
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1 dev
```

Linux / macOS，在仓库目录执行：

```bash
bash scripts/site.sh setup
bash scripts/site.sh dev
```

开发服务默认仅监听本机。打开命令输出中的地址，按 `Ctrl+C` 停止。`ExecutionPolicy Bypass` 仅作用于该次 PowerShell 进程，不修改机器执行策略。

## 常用操作

以下以 Bash 为例。Windows 将 `bash scripts/site.sh` 换成 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\site.ps1`，其余参数相同。

```bash
bash scripts/site.sh doctor
bash scripts/site.sh check
bash scripts/site.sh build
bash scripts/site.sh package --source dist --out artifacts
bash scripts/site.sh deploy native
bash scripts/site.sh status
bash scripts/site.sh stop
```

`deploy native` 部署已有的 `dist/`，先运行 `build`。默认站点为 `http://127.0.0.1:8080`。正式域名、对外监听、开机服务、Linux 容器和 GitHub Pages 的配置见[部署指南](docs/deployment.zh.md)。首次配置完成后，原生与容器部署均可用一条命令更新。

## 内容与结构

| 位置                                            | 用途                                            |
| ----------------------------------------------- | ----------------------------------------------- |
| `src/content/products.ts`                       | 产品注册表、中英文介绍、FAQ、使用场景及下载配置 |
| `src/content/ui.ts`                             | 导航、首页和公共界面文案                        |
| `src/components/`、`src/layouts/`、`src/pages/` | 可复用界面、页面布局与真实双语路由              |
| `public/images/`                                | 随仓库分发的品牌与展示素材                      |
| `scripts/`、`config/`                           | 初始化、检查、打包和部署入口                    |
| `.github/workflows/`                            | 跨平台检查、浏览器测试与可选 Pages 发布         |

中文路由以 `/zh/` 开始，英文以 `/en/` 开始。切换语言保留当前产品及对应章节。根入口默认中文，并记住访客主动选择的语言。

QCopilots 的 Windows、macOS、Linux 下载 URL 当前为 `null`，页面显示“下载入口稍后开放”。这是网站链接的待补充状态，不表示产品尚未发布。填写发行包地址后即可开放对应入口。QCopilots-Search 链接指向真实的 GitHub Releases 最新发布页。

## 检查与发布

仓库固定 Node 24.22.1、npm 11.19.1 和依赖锁文件。日常更新使用 `npm ci`，依赖升级需同步更新锁文件并通过 CI。浏览器测试依赖单独安装，普通初始化不会强制下载浏览器。

GitHub Actions 配置 Windows、Linux、macOS 构建检查，根路径和项目子路径检查，Chromium / Firefox / WebKit 测试，原生部署生命周期以及 Linux 容器冒烟测试。只有满足发布条件的工作流才取得 Pages 写入权限。详见[维护指南中的验证说明](docs/maintenance.zh.md#验证与发布)。

普通 CI runner 不等于 Windows 10 / 11、全部 Linux 发行版或每一款 Mac 的真机验证。系统服务开机运行也需要在目标环境验收。

## 素材与授权

产品图标保留来源，产品窗口视觉明确标为界面示意。详见[素材记录](docs/assets.md)。本仓库没有替所有产品或第三方素材指定统一许可证，产品与依赖的授权以各自来源为准。
